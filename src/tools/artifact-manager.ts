/**
 * Agent Artifact Manager
 * Manages artifact generation, storage, and handoff between agents
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { AgentRole, IsolationContext } from '../types/index.js';

export interface Artifact {
  id: string;
  type: 'schema' | 'interface' | 'endpoint' | 'component' | 'test' | 'documentation';
  name: string;
  path: string;
  content: string;
  metadata: Record<string, any>;
  producedBy: AgentRole;
  consumedBy?: AgentRole[];
  timestamp: Date;
}

export interface Handoff {
  id: string;
  fromAgent: AgentRole;
  toAgent: AgentRole;
  artifacts: Artifact[];
  message?: string;
  timestamp: Date;
}

/**
 * Manages artifacts and handoffs between agents
 */
export class ArtifactManager {
  private artifacts: Map<string, Artifact> = new Map();
  private handoffs: Handoff[] = [];
  private workspacePath: string;

  constructor(
    basePath: string = process.cwd(),
    isolation?: IsolationContext
  ) {
    // Construct workspace path based on isolation context
    if (isolation) {
      this.workspacePath = path.join(
        basePath,
        'solutions',
        'users',
        isolation.userId,
        'projects',
        isolation.projectId,
        'builds',
        isolation.buildRequestId,
        'artifacts'
      );
    } else {
      this.workspacePath = path.join(basePath, 'solutions', '_staging', 'artifacts');
    }
  }

  /**
   * Initialize the artifact workspace
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.workspacePath, { recursive: true });
    await fs.mkdir(path.join(this.workspacePath, 'schemas'), { recursive: true });
    await fs.mkdir(path.join(this.workspacePath, 'interfaces'), { recursive: true });
    await fs.mkdir(path.join(this.workspacePath, 'contracts'), { recursive: true });
  }

  /**
   * Publish an artifact
   */
  async publishArtifact(artifact: Omit<Artifact, 'id' | 'timestamp'>): Promise<Artifact> {
    const fullArtifact: Artifact = {
      ...artifact,
      id: `${artifact.producedBy}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date(),
    };

    // Store in memory
    this.artifacts.set(fullArtifact.id, fullArtifact);

    // Write to disk
    const artifactDir = path.join(this.workspacePath, `${artifact.type}s`);
    await fs.mkdir(artifactDir, { recursive: true });
    const artifactPath = path.join(artifactDir, `${fullArtifact.name}.json`);
    
    await fs.writeFile(
      artifactPath,
      JSON.stringify({
        ...fullArtifact,
        timestamp: fullArtifact.timestamp.toISOString(),
      }, null, 2),
      'utf-8'
    );

    // Also write the actual content to a separate file if it's code
    if (artifact.type !== 'documentation') {
      const contentPath = path.join(artifactDir, fullArtifact.name);
      await fs.writeFile(contentPath, artifact.content, 'utf-8');
    }

    return fullArtifact;
  }

  /**
   * Get artifacts by type
   */
  getArtifactsByType(type: Artifact['type']): Artifact[] {
    return Array.from(this.artifacts.values()).filter((a) => a.type === type);
  }

  /**
   * Get artifacts by producer
   */
  getArtifactsByProducer(agentRole: AgentRole): Artifact[] {
    return Array.from(this.artifacts.values()).filter((a) => a.producedBy === agentRole);
  }

  /**
   * Get artifacts for consumer
   */
  getArtifactsForConsumer(agentRole: AgentRole): Artifact[] {
    return Array.from(this.artifacts.values()).filter(
      (a) => a.consumedBy && a.consumedBy.includes(agentRole)
    );
  }

  /**
   * Create a handoff from one agent to another
   */
  async createHandoff(
    fromAgent: AgentRole,
    toAgent: AgentRole,
    artifactIds: string[],
    message?: string
  ): Promise<Handoff> {
    const artifacts = artifactIds
      .map((id) => this.artifacts.get(id))
      .filter((a): a is Artifact => a !== undefined);

    const handoff: Handoff = {
      id: `handoff-${Date.now()}`,
      fromAgent,
      toAgent,
      artifacts,
      message,
      timestamp: new Date(),
    };

    this.handoffs.push(handoff);

    // Write handoff to disk
    const handoffPath = path.join(this.workspacePath, 'handoffs', `${handoff.id}.json`);
    await fs.mkdir(path.dirname(handoffPath), { recursive: true });
    await fs.writeFile(
      handoffPath,
      JSON.stringify({
        ...handoff,
        timestamp: handoff.timestamp.toISOString(),
      }, null, 2),
      'utf-8'
    );

    return handoff;
  }

  /**
   * Get handoffs for an agent
   */
  getHandoffsForAgent(agentRole: AgentRole): Handoff[] {
    return this.handoffs.filter((h) => h.toAgent === agentRole);
  }

  /**
   * Export all artifacts as a manifest
   */
  async exportManifest(): Promise<void> {
    const manifest = {
      artifacts: Array.from(this.artifacts.values()).map((a) => ({
        ...a,
        timestamp: a.timestamp.toISOString(),
      })),
      handoffs: this.handoffs.map((h) => ({
        ...h,
        timestamp: h.timestamp.toISOString(),
      })),
    };

    const manifestPath = path.join(this.workspacePath, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  /**
   * Load artifacts from workspace
   */
  async loadFromWorkspace(): Promise<void> {
    try {
      const manifestPath = path.join(this.workspacePath, 'manifest.json');
      const manifestData = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestData);

      // Restore artifacts
      for (const artifact of manifest.artifacts) {
        this.artifacts.set(artifact.id, {
          ...artifact,
          timestamp: new Date(artifact.timestamp),
        });
      }

      // Restore handoffs
      this.handoffs = manifest.handoffs.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
    } catch (error) {
      // Manifest doesn't exist yet, that's okay
      console.log('No existing manifest found, starting fresh');
    }
  }

  /**
   * Get workspace path
   */
  getWorkspacePath(): string {
    return this.workspacePath;
  }

  /**
   * Get all artifacts
   */
  getAllArtifacts(): Artifact[] {
    return Array.from(this.artifacts.values());
  }
}
