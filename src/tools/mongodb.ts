/**
 * MongoDB Tool for Bee Agent Framework
 * Provides database operations for agents
 */

import mongoose from 'mongoose';
import { MongoOperation } from '../types/index.js';

/**
 * MongoDB Tool Class
 */
export class MongoDBTool {
  private isConnected: boolean = false;

  constructor(private uri: string) {}

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await mongoose.connect(this.uri);
      this.isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    await mongoose.disconnect();
    this.isConnected = false;
    console.log('Disconnected from MongoDB');
  }

  /**
   * Execute a MongoDB operation
   */
  async execute(operation: MongoOperation): Promise<any> {
    await this.connect();

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not available');

    const collection = db.collection(operation.collection);

    switch (operation.operation) {
      case 'find':
        return await collection.find(operation.query || {}).toArray();

      case 'findOne':
        return await collection.findOne(operation.query || {});

      case 'insert':
        if (!operation.data) throw new Error('Data required for insert operation');
        return await collection.insertOne(operation.data);

      case 'update':
        if (!operation.query || !operation.data) {
          throw new Error('Query and data required for update operation');
        }
        return await collection.updateOne(operation.query, { $set: operation.data });

      case 'delete':
        if (!operation.query) throw new Error('Query required for delete operation');
        return await collection.deleteOne(operation.query);

      default:
        throw new Error(`Unsupported operation: ${operation.operation}`);
    }
  }

  /**
   * Create a tool definition for Bee Agent Framework
   */
  static getToolDefinition() {
    return {
      name: 'mongodb',
      description: 'Execute MongoDB operations (find, insert, update, delete)',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['find', 'findOne', 'insert', 'update', 'delete'],
            description: 'The MongoDB operation to perform',
          },
          collection: {
            type: 'string',
            description: 'The collection name',
          },
          query: {
            type: 'object',
            description: 'Query object for find/update/delete operations',
          },
          data: {
            type: 'object',
            description: 'Data object for insert/update operations',
          },
        },
        required: ['operation', 'collection'],
      },
    };
  }
}
