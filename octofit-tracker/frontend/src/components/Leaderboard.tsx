import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ leaderboard: Ranking[] }>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((failure: unknown) => setError(failure instanceof Error ? failure.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CapabilityCard
        title="Leaderboard"
        description="Compare team point totals."
        loading={loading}
        error={error}
        emptyMessage={!loading && !error && leaderboard.length === 0 ? 'No leaderboard rankings yet.' : undefined}
      />
      {!loading && !error && leaderboard.length > 0 && (
        <ol className="list-group list-group-numbered mt-3" aria-label="Team rankings">
          {leaderboard.map((ranking) => (
            <li className="list-group-item d-flex justify-content-between" key={ranking.teamName}>
              <span>{ranking.teamName}</span>
              <strong>{ranking.totalPoints}</strong>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
