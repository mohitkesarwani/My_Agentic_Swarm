import mongoose, { Schema, Document, Types } from 'mongoose';

export enum BuildStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IBuildRequest {
  requestId: string;
  prompt: string;
  status: BuildStatus;
  stagingPath?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  description: string;
  buildRequests: IBuildRequest[];
  createdAt: Date;
  updatedAt: Date;
}

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
