import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((failure: unknown) => setError(failure instanceof Error ? failure.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CapabilityCard
        title="Teams"
        description="Manage teams and members."
        loading={loading}
        error={error}
        emptyMessage={!loading && !error && teams.length === 0 ? 'No teams yet.' : undefined}
      />
      {!loading && !error && teams.length > 0 && (
        <ul className="list-group mt-3" aria-label="Teams">
          {teams.map((team, index) => (
            <li className="list-group-item" key={`${team.name}-${index}`}>
              {team.name}{team.mascot ? ` - ${team.mascot}` : ''}
              {team.members?.length > 0 && ` (${team.members.length} members)`}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
