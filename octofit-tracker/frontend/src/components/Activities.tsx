import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((failure: unknown) => setError(failure instanceof Error ? failure.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CapabilityCard
        title="Activities"
        description="Track student activity minutes and points."
        loading={loading}
        error={error}
        emptyMessage={!loading && !error && activities.length === 0 ? 'No activities yet.' : undefined}
      />
      {!loading && !error && activities.length > 0 && (
        <ul className="list-group mt-3" aria-label="Activities">
          {activities.map((activity, index) => (
            <li className="list-group-item" key={`${activity.type}-${index}`}>
              {activity.type}: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
