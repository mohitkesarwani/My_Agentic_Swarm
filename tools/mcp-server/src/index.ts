import { McpServer } from './server.js';

const server = new McpServer();

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  // eslint-disable-next-line no-console
  console.log('MCP Server Commands: getRepoMap, getStandards, getKnowledgeBaseIndex, writeADR, createSolutionWorkspace');
  process.exit(0);
}

server.execute(command, args).then((result) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('MCP Server error:', err);
  process.exit(1);
});
