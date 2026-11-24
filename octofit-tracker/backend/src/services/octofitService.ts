import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Activity data is required');
  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };
  if (
    typeof userId !== 'string' ||
    typeof teamId !== 'string' ||
    typeof type !== 'string' ||
    type.trim().length === 0 ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw httpError(400, 'A valid userId, teamId, type, and positive minutes are required');
  }
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw httpError(400, 'Invalid userId or teamId');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user || !team) throw httpError(404, 'User or team not found');

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Team data is required');
  const { name, mascot, members } = input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw httpError(400, 'Team name is required');
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw httpError(400, 'Team mascot is required');
  }

  const memberIds = members === undefined ? [] : members;
  if (!Array.isArray(memberIds) || memberIds.some((member) => typeof member !== 'string' || !mongoose.isValidObjectId(member))) {
    throw httpError(400, 'Team members must be valid user IDs');
  }
  const existingMembers = await User.find({ _id: { $in: memberIds } }).distinct('_id');
  if (existingMembers.length !== memberIds.length) {
    throw httpError(404, 'One or more team members were not found');
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const teams = await Team.find({
    _id: { $in: totals.map((entry) => entry._id) },
  }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals
    .map((entry) => ({
      teamName: teamNames.get(entry._id.toString()) ?? 'Unknown team',
      totalPoints: entry.totalPoints,
      rank: 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  if (!userEmail) throw httpError(400, 'User email is required');
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(5)
    .lean();
  const recentTypes = recentActivities.map((activity) => activity.type.toLowerCase());
  const activityFocus = recentTypes.includes('strength')
    ? 'strength'
    : recentTypes.some((type) => type === 'run' || type === 'cycle')
      ? 'endurance'
      : recentTypes.includes('walk')
        ? 'mobility'
        : user.fitnessGoal;

  const workouts = await Workout.find().lean();
  const matching = workouts.filter((workout) => workout.focus.toLowerCase() === activityFocus.toLowerCase());
  const ordered = [...matching, ...workouts.filter((workout) => !matching.includes(workout))];
  return ordered.map((workout) => ({
    ...workout,
    reason: recentTypes.length > 0
      ? `Matches ${recentTypes[0]} activity and supports ${activityFocus}.`
      : `Matches your ${activityFocus} fitness goal.`,
  }));
}

export { User };
