import { useEffect, useState } from 'react';
import { apiClient } from '../api/client.js';

interface HealthData {
  status: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export function HealthScreen() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<HealthData>('/health')
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!health) return null;

  return (
    <section>
      <h2>API Health</h2>
      <dl style={{ lineHeight: 1.8 }}>
        <dt><strong>Status</strong></dt><dd>{health.status}</dd>
        <dt><strong>Version</strong></dt><dd>{health.version}</dd>
        <dt><strong>Uptime</strong></dt><dd>{health.uptime}s</dd>
        <dt><strong>Timestamp</strong></dt><dd>{health.timestamp}</dd>
      </dl>
    </section>
  );
}
