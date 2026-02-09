import { Orchestrator } from './orchestrator.js';

const requestPath = process.argv[2];
if (!requestPath) {
  // eslint-disable-next-line no-console
  console.log('Usage: orchestrator <build-request-path>');
  process.exit(0);
}

const orchestrator = new Orchestrator();
orchestrator.run(requestPath).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Orchestrator failed:', err);
  process.exit(1);
});
