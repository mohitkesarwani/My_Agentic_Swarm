import mongoose, { Schema, Document, Types } from 'mongoose';

export enum BuildStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IAgentActivity {
  timestamp: Date;
  agentRole: string;
  taskId: string;
  action: string;
  status: 'started' | 'progress' | 'completed' | 'failed';
  details?: string;
}

export interface IArtifact {
  type: 'schema' | 'interface' | 'endpoint' | 'component' | 'test' | 'documentation';
  name: string;
  path: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface IAgentHandoff {
  fromAgent: string;
  toAgent: string;
  taskId: string;
  artifacts: IArtifact[];
  message?: string;
  timestamp: Date;
}

export interface IBuildRequest {
  requestId: string;
  prompt: string;
  status: BuildStatus;
  stagingPath?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  agentActivities?: IAgentActivity[];
  artifacts?: IArtifact[];
  handoffs?: IAgentHandoff[];
  logs?: string[];
}

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  description: string;
  buildRequests: IBuildRequest[];
  createdAt: Date;
  updatedAt: Date;
}

const agentActivitySchema = new Schema<IAgentActivity>(
  {
    timestamp: { type: Date, default: Date.now },
    agentRole: { type: String, required: true },
    taskId: { type: String, required: true },
    action: { type: String, required: true },
    status: { type: String, enum: ['started', 'progress', 'completed', 'failed'], required: true },
    details: { type: String },
  },
  { _id: false }
);

const artifactSchema = new Schema<IArtifact>(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    path: { type: String, required: true },
    content: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const agentHandoffSchema = new Schema<IAgentHandoff>(
  {
    fromAgent: { type: String, required: true },
    toAgent: { type: String, required: true },
    taskId: { type: String, required: true },
    artifacts: { type: [artifactSchema], default: [] },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const buildRequestSchema = new Schema<IBuildRequest>(
  {
    requestId: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BuildStatus),
      default: BuildStatus.PENDING,
    },
    stagingPath: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
    agentActivities: {
      type: [agentActivitySchema],
      default: [],
    },
    artifacts: {
      type: [artifactSchema],
      default: [],
    },
    handoffs: {
      type: [agentHandoffSchema],
      default: [],
    },
    logs: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    buildRequests: {
      type: [buildRequestSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's projects
projectSchema.index({ userId: 1, createdAt: -1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
