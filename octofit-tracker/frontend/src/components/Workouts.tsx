import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; focus?: string; reason: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch((failure: unknown) => setError(failure instanceof Error ? failure.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CapabilityCard
        title="Workout suggestions"
        description="Recommend workouts from activity patterns."
        loading={loading}
        error={error}
        emptyMessage={!loading && !error && suggestions.length === 0 ? 'No workout suggestions yet.' : undefined}
      />
      {!loading && !error && suggestions.length > 0 && (
        <ul className="list-group mt-3" aria-label="Workout suggestions">
          {suggestions.map((workout, index) => (
            <li className="list-group-item" key={`${workout.title}-${index}`}>
              <strong>{workout.title}</strong>
              {workout.reason && <p className="mb-0">{workout.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
