import { Routes, Route } from 'react-router-dom';
import { HealthScreen } from './screens/HealthScreen.js';

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem' }}>Agentic Swarm</h1>
      <Routes>
        <Route path="/" element={<HealthScreen />} />
      </Routes>
    </div>
  );
}
