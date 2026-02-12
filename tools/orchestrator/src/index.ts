import { Orchestrator } from './orchestrator.js';
import { EnhancedOrchestrator } from './enhanced-orchestrator.js';

const requestPath = process.argv[2];
const useEnhanced = process.argv.includes('--enhanced');

if (!requestPath) {
  // eslint-disable-next-line no-console
  console.log('Usage: orchestrator <build-request-path> [--enhanced]');
  console.log('  --enhanced: Use enhanced orchestrator with NLP parsing and agent coordination');
  process.exit(0);
}

const orchestrator = useEnhanced ? new EnhancedOrchestrator() : new Orchestrator();
orchestrator.run(requestPath).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Orchestrator failed:', err);
  process.exit(1);
});
