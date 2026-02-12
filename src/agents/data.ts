/**
 * Data Agent - Database Schema and Data Model Design
 * Specializes in MongoDB schema design, Mongoose models, and data relationships
 */

import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { UnconstrainedMemory } from 'beeai-framework/memory/unconstrainedMemory';
import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';
import { DynamicTool, StringToolOutput } from 'beeai-framework/tools/base';
import { FileSystemTool } from '../tools/filesystem.js';
import { MongoDBTool } from '../tools/mongodb.js';
import { AgentTask, AgentResponse, IsolationContext } from '../types/index.js';

export class DataAgent {
  private agent: ReActAgent;
  private fileSystemTool: FileSystemTool;
  private mongoTool?: MongoDBTool;

  constructor(
    private llm: GroqChatModel,
    basePath: string = process.cwd(),
    mongoUri?: string,
    isolation?: IsolationContext
  ) {
    this.fileSystemTool = new FileSystemTool(basePath, 'data', isolation);
    if (mongoUri) {
      this.mongoTool = new MongoDBTool(mongoUri);
    }

    const tools = [];

    // File system tool
    const fsToolWrapper = new DynamicTool({
      name: 'filesystem',
      description: 'Read and write database schema files and Mongoose models. Files will be saved to solutions/deliverables/data/ directory.',
      inputSchema: FileSystemTool.getToolDefinition().inputSchema,
      handler: async (input: any) => {
        const result = await this.fileSystemTool.execute(input);
        return new StringToolOutput(JSON.stringify(result));
      },
    });
    tools.push(fsToolWrapper);

    // MongoDB tool (if configured)
    if (this.mongoTool) {
      const mongoToolWrapper = new DynamicTool({
        name: 'mongodb',
        description: 'Execute MongoDB operations and queries',
        inputSchema: MongoDBTool.getToolDefinition().inputSchema,
        handler: async (input: any) => {
          const result = await this.mongoTool!.execute(input);
          return new StringToolOutput(JSON.stringify(result));
        },
      });
      tools.push(mongoToolWrapper);
    }

    // Initialize the Data agent
    this.agent = new ReActAgent({
      llm: this.llm,
      memory: new UnconstrainedMemory(),
      tools,
    });
  }

  /**
   * Execute a data modeling task
   */
  async executeTask(task: AgentTask): Promise<AgentResponse> {
    const systemPrompt = `You are a Data Agent specializing in database design and data modeling.

Your expertise:
- MongoDB and NoSQL database design
- Mongoose ODM and schema definition
- Data relationships and references
- Indexing strategies
- Data validation and constraints
- Schema versioning and migrations
- Data normalization and denormalization

Task to complete: ${task.description}

Instructions:
1. Design appropriate database schemas
2. Create Mongoose models with proper validation
3. Define indexes for query optimization
4. Establish relationships between collections
5. Use the filesystem tool to create model files
6. All generated files will be saved to solutions/deliverables/data/ directory
7. Create a schema.json file documenting the data model
8. Use relative paths (e.g., 'models/User.ts' will be saved to solutions/deliverables/data/models/User.ts)

Provide a detailed description of the data model and schemas created.`;

    try {
      const response = await this.agent.run(
        { prompt: systemPrompt },
        {
          execution: {
            maxIterations: 10,
          },
        }
      );

      return {
        success: true,
        message: response.result.text || 'Data modeling completed',
        data: response.result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Data modeling failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate Mongoose schema from requirements
   */
  async generateSchema(
    entityName: string,
    requirements: string
  ): Promise<AgentResponse> {
    const schemaPrompt = `Generate a Mongoose schema for entity: ${entityName}

Requirements: ${requirements}

Create a complete Mongoose model with:
1. Schema definition with all fields and types
2. Validation rules
3. Indexes for performance
4. Virtual properties if needed
5. Schema methods and statics
6. Timestamps

Save the model to 'models/${entityName}.ts' using the filesystem tool.`;

    try {
      const response = await this.agent.run(
        { prompt: schemaPrompt },
        {
          execution: {
            maxIterations: 8,
          },
        }
      );

      return {
        success: true,
        message: `Schema for ${entityName} generated`,
        data: response.result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Schema generation failed for ${entityName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export schema definition for other agents
   */
  async exportSchemaContract(workspacePath: string): Promise<any> {
    const exportPrompt = `Read all schema files from the data workspace and create a schema-contract.json file.

The contract should include:
- Collection names
- Field definitions with types
- Required fields
- Relationships between collections
- API-friendly TypeScript interfaces

This will be used by the backend agent to create typed endpoints.

Use the filesystem tool to read models and write the contract file.`;

    try {
      const response = await this.agent.run(
        { prompt: exportPrompt },
        {
          execution: {
            maxIterations: 10,
          },
        }
      );

      return {
        success: true,
        message: 'Schema contract exported',
        data: response.result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Schema export failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
