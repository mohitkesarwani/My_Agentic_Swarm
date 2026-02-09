import { describe, it, expect } from 'vitest';
import { McpServer } from '../server.js';

describe('McpServer', () => {
  const server = new McpServer();

  it('getRepoMap returns directories', async () => {
    const result = await server.getRepoMap();
    expect(result.directories).toBeInstanceOf(Array);
  });

  it('getStandards returns files object', async () => {
    const result = await server.getStandards();
    expect(result.files).toBeDefined();
    expect(typeof result.files).toBe('object');
  });

  it('getKnowledgeBaseIndex returns entries', async () => {
    const result = await server.getKnowledgeBaseIndex();
    expect(result.entries).toBeInstanceOf(Array);
  });

  it('execute dispatches correctly', async () => {
    const result = await server.execute('getRepoMap', []);
    expect(result).toHaveProperty('directories');
  });

  it('execute throws on unknown command', async () => {
    await expect(server.execute('badCommand', [])).rejects.toThrow('Unknown command');
  });
});
