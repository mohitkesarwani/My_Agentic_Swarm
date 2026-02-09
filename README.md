# My Agentic Swarm 🐝

A powerful multi-agent system built on the IBM Bee Agent Framework that automates software development through specialized AI agents working in an Architect-Worker pattern.

## Overview

My Agentic Swarm is a TypeScript-based orchestration system that uses multiple AI agents to break down, execute, and validate software development tasks. It leverages the Groq LLM (Llama 3.3-70B) through the IBM Bee Agent Framework to coordinate specialized agents for frontend, backend, and QA work.

**Perfect for:** Rapid prototyping, generating boilerplate code, creating full-stack applications, and automating repetitive development tasks with AI-powered agents that understand your requirements and write production-ready code.

## Features

- 🏗️ **Architect Agent**: Breaks down complex requirements into actionable tasks
- 💻 **Frontend Agent**: Develops React components with Tailwind CSS
- 🔧 **Backend Agent**: Creates Node.js/Express APIs and database integrations
- 🧪 **QA Agent**: Generates tests and validates code quality
- 🔄 **Intelligent Orchestration**: Manages dependencies and task execution flow
- 📦 **Tool Integration**: File system operations, MongoDB, and deployment automation

## Architecture

```
┌─────────────────┐
│  User Prompt    │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Architect│  (Planning Phase)
    │  Agent   │
    └────┬─────┘
         │
    ┌────▼────────────────────┐
    │   Task Distribution     │
    └──┬──────────┬──────────┬┘
       │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
  │Frontend│ │Backend │ │   QA   │  (Development Phase)
  │ Agent  │ │ Agent  │ │  Agent │
  └────┬───┘ └───┬────┘ └───┬────┘
       │         │          │
       └─────────┴──────────┘
                 │
            ┌────▼─────┐
            │   QA     │  (Testing Phase)
            │Validation│
            └────┬─────┘
                 │
            ┌────▼──────┐
            │Deployment │  (Optional)
            └───────────┘
```

## Table of Contents

- [Quick Start](#quick-start)
- [Monorepo Structure](#monorepo-structure)
- [Step-by-Step Guide: Building Features with Agentic Swarm](#step-by-step-guide-building-features-with-agentic-swarm)
- [Workflow Overview](#workflow-overview)
- [Sample Commands](#sample-commands)
- [Environment Configuration](#environment-configuration)
- [Deployment Guide](#deployment-guide)
- [Agents](#agents)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Groq API key (free tier available at [groq.com](https://groq.com))
- Optional: MongoDB instance for database operations
- Optional: Render.com account for deployment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mohitkesarwani/My_Agentic_Swarm.git
cd My_Agentic_Swarm
```

2. Install dependencies:
```bash
npm install
```

**Note**: The project uses `.npmrc` with `legacy-peer-deps=true` to handle peer dependency resolution with beeai-framework.

3. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

4. Build the project:
```bash
npm run build
```

### Basic Usage

Run the swarm with a development prompt:

```bash
npm start "Create a React todo app with MongoDB backend"
```

Or for development with auto-reload:

```bash
npm run dev "Build a REST API for user authentication"
```

## Monorepo Structure

This project follows a **monorepo architecture** where the agentic swarm can generate and manage multiple project types within a single repository structure:

```
My_Agentic_Swarm/
├── src/                          # Core swarm system
│   ├── agents/                   # AI agent implementations
│   │   ├── architect.ts          # Task planning & orchestration
│   │   ├── frontend.ts           # React/Tailwind development
│   │   ├── backend.ts            # Node.js/Express/MongoDB APIs
│   │   └── qa.ts                 # Testing & validation
│   ├── tools/                    # Agent tools & integrations
│   │   ├── filesystem.ts         # File operations
│   │   ├── mongodb.ts            # Database operations
│   │   └── render-deploy.ts      # Deployment automation
│   ├── types/                    # TypeScript type definitions
│   ├── swarm.ts                  # Main orchestrator
│   └── index.ts                  # Entry point
├── solutions/                    # Agent-generated deliverables (gitignored)
│   └── deliverables/             # Organized by agent type
│       ├── frontend/             # Frontend Agent outputs
│       │   ├── components/       # React components
│       │   ├── pages/            # Page components
│       │   ├── styles/           # Tailwind CSS
│       │   └── App.tsx           # Main app
│       ├── backend/              # Backend Agent outputs
│       │   ├── routes/           # API routes
│       │   ├── models/           # MongoDB models
│       │   ├── middleware/       # Express middleware
│       │   └── server.ts         # Server entry
│       └── qa/                   # QA Agent outputs
│           ├── tests/            # Test files
│           └── reports/          # Quality reports
├── package.json                  # Root dependencies (swarm system)
├── tsconfig.json                 # TypeScript configuration
└── .env                          # Environment variables

```

### Technology Stack

**Frontend (Generated by Frontend Agent):**
- React (functional components with hooks)
- Tailwind CSS (utility-first styling)
- TypeScript
- Mobile-first responsive design

**Backend (Generated by Backend Agent):**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- RESTful API architecture
- JWT authentication (when requested)
- TypeScript

**Agentic Swarm Core:**
- IBM Bee Agent Framework
- Groq LLM (Llama 3.3-70B)
- TypeScript
- Jest for testing

## Step-by-Step Guide: Building Features with Agentic Swarm

This section walks you through using the IBM Bee framework-powered agentic swarm to build and test features from start to finish.

### Step 1: Prepare Your Environment

1. **Set up API keys in `.env`:**
```bash
# Required: Get free key from https://console.groq.com
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# Optional: MongoDB connection
MONGODB_URI=mongodb://localhost:27017/agentic_swarm
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Optional: Render deployment webhook
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxxxx?key=xxxxx

# Agent configuration
ARCHITECT_MODEL=llama-3.3-70b-versatile
WORKER_MODEL=llama-3.3-70b-versatile

# Optional: MCP Server Configuration (Model Context Protocol for fetching latest information)
MCP_API_URL=https://api.mcp.example.com
MCP_API_KEY=your_mcp_api_key_here

# Logging level: debug, info, warn, error
LOG_LEVEL=info
```

2. **Ensure dependencies are installed:**
```bash
npm install
npm run build
```

### Step 2: Define Your Feature Request

Write a clear, descriptive prompt that specifies:
- What you want to build
- Key features or requirements
- Technology preferences (if any)

**Examples of good prompts:**
```bash
# Full-stack application
"Create a task management app with React frontend, Express backend, and MongoDB. Include user authentication, task CRUD operations, and priority levels."

# Frontend only
"Build a responsive landing page with React and Tailwind CSS featuring a hero section, features grid, testimonials, and contact form."

# Backend only
"Create a REST API for a blog platform with endpoints for posts, comments, and users. Include MongoDB models and validation."

# Testing focus
"Generate Jest unit tests for the user authentication module including login, registration, and password reset."
```

### Step 3: Run the Agentic Swarm

Execute your prompt using the swarm:

```bash
npm start "Your feature request here"
```

**What happens internally:**
1. **Planning Phase**: Architect Agent analyzes your prompt and creates a task breakdown
2. **Development Phase**: Specialized agents (Frontend, Backend) execute tasks
3. **Testing Phase**: QA Agent validates the code and generates tests
4. **Deployment Phase** (optional): Deploy tool triggers deployment to Render.com

### Step 4: Monitor the Workflow

The swarm provides real-time feedback:

```bash
🐝 My Agentic Swarm - Multi-Agent Development System

Initializing agents...
📝 Processing request: "Create a React todo app"

Phase 1: Planning with Architect Agent
✅ Architect created 3 tasks

Phase 2: Development with Worker Agents
  ⏳ [Frontend] Create React components...
  ✅ [Frontend] Create React components - completed
  ⏳ [Backend] Build Express API...
  ✅ [Backend] Build Express API - completed

Phase 3: Testing with QA Agent
  ⏳ [QA] Generate and run tests...
  ✅ [QA] Generate and run tests - completed

✅ Workflow completed successfully!
```

### Step 5: Review Generated Code

Navigate to the generated project structure:

```bash
# View generated frontend code
ls -la generated/frontend/src/

# View generated backend code
ls -la generated/backend/src/

# Check the generated tests
ls -la generated/backend/src/__tests__/
```

### Step 6: Test the Generated Features

**For Frontend:**
```bash
cd generated/frontend
npm install
npm start       # Start development server
# Visit http://localhost:3000
```

**For Backend:**
```bash
cd generated/backend
npm install

# Ensure MongoDB is running
# Local: mongod
# Or set MONGODB_URI to Atlas connection string

npm start       # Start the server
# API available at http://localhost:5000
```

**Run Tests:**
```bash
# In the generated project directory
npm test        # Run all tests
npm run test:watch  # Watch mode for development
```

### Step 7: Iterate and Refine

If you need changes or additions:

```bash
# Run another prompt to extend functionality
npm start "Add user profile page to the todo app"

# Or request specific improvements
npm start "Add pagination to the blog API endpoints"

# Generate additional tests
npm start "Create integration tests for the authentication flow"
```

### Step 8: Deploy to Production

See the [Deployment Guide](#deployment-guide) section below for detailed instructions on deploying to Render.com.

### Understanding the IBM Bee Framework Integration

The swarm uses IBM Bee Agent Framework's core concepts:

1. **Agents**: Specialized AI agents with specific roles (Architect, Frontend, Backend, QA)
2. **Tools**: Capabilities agents can use (file operations, database access, deployment)
3. **Orchestration**: The swarm coordinates agents using the Architect-Worker pattern
4. **LLM Integration**: Groq's fast inference for Llama 3.3-70B model

Each agent:
- Has a specific persona and expertise
- Can use designated tools
- Communicates via structured prompts
- Returns validated results

This architecture ensures:
- **Modularity**: Each agent focuses on its domain
- **Reliability**: QA agent validates all outputs
- **Efficiency**: Parallel task execution where possible
- **Quality**: Multi-iteration refinement with feedback loops

## Workflow Overview

The agentic swarm follows a structured workflow that ensures quality and consistency:

### Phase 1: Planning (Architect Agent)

```
User Prompt → Architect Agent
                    ↓
           Task Breakdown & Analysis
                    ↓
        ┌───────────┴───────────┐
        │   Task Distribution    │
        └───────────┬───────────┘
                    ↓
    [Frontend Tasks] [Backend Tasks] [QA Tasks]
```

**What happens:**
- Architect analyzes the user's natural language request
- Breaks down complex requirements into specific, actionable tasks
- Assigns each task to the appropriate specialized agent
- Determines task dependencies and execution order
- Creates a validation plan for the QA agent

**Example output:**
```
Task 1: [Frontend] Create React app structure with Tailwind CSS
Task 2: [Frontend] Build TodoList and TodoItem components
Task 3: [Backend] Set up Express server with MongoDB connection
Task 4: [Backend] Create Todo API endpoints (GET, POST, PUT, DELETE)
Task 5: [QA] Write integration tests for the API
Task 6: [QA] Test frontend component rendering
```

### Phase 2: Development (Worker Agents)

```
        Tasks → Worker Agents
                      ↓
      ┌───────────────┼───────────────┐
      ↓               ↓               ↓
 [Frontend Agent] [Backend Agent] [Other Tasks]
      ↓               ↓               ↓
   React Code     Express API     Generated
   Components     + MongoDB       Code Files
      ↓               ↓               ↓
      └───────────────┴───────────────┘
                      ↓
              Code Artifacts Ready
```

**Frontend Agent:**
- Creates React components using functional components and hooks
- Applies Tailwind CSS for styling
- Implements mobile-first responsive design
- Uses TypeScript for type safety
- Generates `package.json` and configuration files

**Backend Agent:**
- Sets up Express.js server structure
- Creates MongoDB models with Mongoose
- Implements RESTful API endpoints
- Adds input validation and error handling
- Configures middleware (CORS, body parsing, etc.)

**Each agent:**
- Uses file system tools to create/modify files
- Follows best practices for their domain
- Writes clean, documented code
- Handles errors gracefully

### Phase 3: Testing (QA Agent)

```
     Generated Code → QA Agent
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
        Code Review          Test Generation
              ↓                     ↓
        Validation           Jest Test Suites
              ↓                     ↓
              └──────────┬──────────┘
                         ↓
                   Test Execution
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
         ✅ Pass                ❌ Fail
              ↓                     ↓
         Workflow              Feedback to
         Complete              Architect
```

**QA Agent responsibilities:**
- Reviews generated code for quality and best practices
- Generates comprehensive Jest test suites
- Tests API endpoints with various inputs
- Validates frontend component rendering
- Checks error handling and edge cases
- Reports issues back to the Architect for fixing

**Types of tests generated:**
- **Unit tests**: Individual functions and methods
- **Integration tests**: API endpoints and database operations
- **Component tests**: React component rendering and behavior
- **Edge case tests**: Error scenarios and boundary conditions

### Phase 4: Deployment (Optional)

```
     Completed Code → Deployment Tool
                          ↓
                  Render.com API
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
      Frontend Service          Backend Service
       (Static Site)            (Web Service)
              ↓                       ↓
              └───────────┬───────────┘
                          ↓
                  Live Application
                   (Production)
```

**Deployment process:**
- Validates that all tests pass
- Commits code to the repository
- Triggers Render.com deployment via webhook
- Monitors deployment status
- Provides deployment URLs

### Complete Workflow Example

**Input:**
```bash
npm start "Create a blog platform with React frontend and Express backend"
```

**Execution flow:**
1. **Architect** creates 8 tasks (4 frontend, 3 backend, 1 QA)
2. **Frontend Agent** generates:
   - `BlogList.tsx` - displays list of blog posts
   - `BlogPost.tsx` - individual post component
   - `CreatePost.tsx` - form for creating posts
   - `App.tsx` - main app with routing
3. **Backend Agent** generates:
   - `server.ts` - Express server setup
   - `models/Post.ts` - MongoDB post model
   - `routes/posts.ts` - API endpoints
4. **QA Agent** generates:
   - `posts.test.ts` - API endpoint tests
   - `BlogList.test.tsx` - component tests
5. **Deployment** (if configured):
   - Deploys frontend to Render static site
   - Deploys backend to Render web service
   - Connects them via environment variables

**Output:**
```
✅ Workflow completed successfully!

Tasks executed: 8
- ✅ [Frontend] Create blog components
- ✅ [Frontend] Set up React routing
- ✅ [Frontend] Add Tailwind styling
- ✅ [Frontend] Build create post form
- ✅ [Backend] Set up Express server
- ✅ [Backend] Create MongoDB models
- ✅ [Backend] Build API endpoints
- ✅ [QA] Generate and run tests

🎉 Development workflow completed!
```

### Agent Orchestration Details

**Communication Pattern:**
```
Architect (Supervisor)
    ↓ assigns tasks
Worker Agents (Frontend, Backend)
    ↓ produce artifacts
QA Agent (Validator)
    ↓ provides feedback
Architect (Coordinator)
    ↓ decides next steps
```

**Error Handling:**
- If a worker agent fails, Architect reassigns or breaks down the task
- If QA finds issues, Architect coordinates fixes with relevant agents
- Maximum retry count configurable (default: 2)
- Detailed error logging at each step

**Parallel Execution:**
- Independent tasks can run concurrently
- Dependencies are respected (e.g., backend models before API endpoints)
- Maximizes efficiency while maintaining correctness

## Sample Commands

### Quick Examples

**Create a landing page:**
```bash
npm start "Create a modern landing page with React and Tailwind CSS featuring a hero section, features grid, and contact form"
```

**Build an authentication system:**
```bash
npm start "Create a user authentication system with login, registration, JWT tokens, and password reset functionality"
```

**Generate a REST API:**
```bash
npm start "Build a RESTful API for an e-commerce platform with products, orders, and user management"
```

### Domain-Specific Examples

**Social Media:**
```bash
npm start "Create a Twitter-like app with posts, likes, comments, and user profiles"
```

**E-commerce:**
```bash
npm start "Build a product catalog with shopping cart, checkout, and order management"
```

**Productivity:**
```bash
npm start "Create a Kanban board with drag-and-drop, task assignment, and progress tracking"
```

**Data Visualization:**
```bash
npm start "Build a dashboard with charts, graphs, and real-time data updates using MongoDB"
```

### Component-Specific Examples

**Frontend only:**
```bash
npm start "Create a responsive navbar with dropdown menus, mobile hamburger, and theme toggle"
npm start "Build a data table component with sorting, filtering, and pagination"
npm start "Create a multi-step form with validation and progress indicator"
```

**Backend only:**
```bash
npm start "Create Express middleware for authentication, rate limiting, and error handling"
npm start "Build a GraphQL API for a blog platform with queries and mutations"
npm start "Create MongoDB aggregation pipelines for analytics and reporting"
```

**Testing focus:**
```bash
npm start "Write unit tests for the user service including all CRUD operations"
npm start "Create integration tests for the authentication flow with JWT tokens"
npm start "Generate E2E tests for the checkout process"
```

### Advanced Commands

**With specific requirements:**
```bash
npm start "Create a real-time chat app with Socket.io, user typing indicators, and message history stored in MongoDB"
```

**Microservices architecture:**
```bash
npm start "Build a microservices-based API gateway with user service, product service, and order service"
```

**With deployment:**
```bash
# Ensure RENDER_DEPLOY_HOOK is set in .env
npm start "Create a portfolio website with blog and deploy it to production"
```

### Development Mode Examples

For faster iteration during development:

```bash
# Use dev mode for live reload
npm run dev "Add search functionality to the existing product list"

# Iterate on existing code
npm run dev "Refactor the authentication middleware to use refresh tokens"

# Debug specific functionality
npm run dev "Fix the pagination bug in the user list endpoint"
```

## Environment Configuration

### Complete .env Setup

```bash
#===========================================
# REQUIRED CONFIGURATION
#===========================================

# Groq API Key (REQUIRED)
# Get your free API key at: https://console.groq.com/keys
# Free tier: 30 requests/min, 14,400 requests/day
GROQ_API_KEY=gsk_your_actual_groq_api_key_here


#===========================================
# DATABASE CONFIGURATION (OPTIONAL)
#===========================================

# MongoDB Connection String
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/agentic_swarm

# Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Option 3: MongoDB with authentication
# MONGODB_URI=mongodb://user:password@localhost:27017/agentic_swarm?authSource=admin

# Leave empty or comment out if not using MongoDB
# MONGODB_URI=


#===========================================
# DEPLOYMENT CONFIGURATION (OPTIONAL)
#===========================================

# Render.com Deploy Hook
# Get from: Render Dashboard → Settings → Deploy Hook
# Format: https://api.render.com/deploy/srv-xxxxx?key=xxxxx
RENDER_DEPLOY_HOOK=

# Alternative: Render API Key (for advanced deployments)
# RENDER_API_KEY=


#===========================================
# AGENT CONFIGURATION
#===========================================

# Architect Agent Model (task planning and orchestration)
# Options: llama-3.3-70b-versatile (recommended), llama-3.1-70b-versatile
ARCHITECT_MODEL=llama-3.3-70b-versatile

# Worker Agent Model (frontend, backend, QA agents)
# Options: llama-3.3-70b-versatile (best quality), llama-3.1-8b-instant (faster)
WORKER_MODEL=llama-3.3-70b-versatile

# For faster iterations, you can use a lighter model for workers:
# WORKER_MODEL=llama-3.1-8b-instant


#===========================================
# MCP SERVER CONFIGURATION (OPTIONAL)
#===========================================

# Model Context Protocol Server for fetching latest information
# Used to enhance agent capabilities with up-to-date information
MCP_API_URL=https://api.mcp.example.com
MCP_API_KEY=your_mcp_api_key_here

# Leave empty if not using MCP Server
# MCP_API_URL=
# MCP_API_KEY=


#===========================================
# LOGGING CONFIGURATION
#===========================================

# Log Level: debug, info, warn, error
# - debug: Detailed output (use for troubleshooting)
# - info: Standard output (recommended for development)
# - warn: Warnings and errors only
# - error: Errors only (recommended for production)
LOG_LEVEL=info


#===========================================
# ADVANCED CONFIGURATION (OPTIONAL)
#===========================================

# Custom base path for generated projects
# BASE_PATH=/custom/path/to/projects

# Maximum retries for failed agent tasks
# MAX_RETRIES=2

# Agent timeout in milliseconds
# AGENT_TIMEOUT=300000

# Enable/disable automatic deployment
# AUTO_DEPLOY=false
```

### Environment-Specific Configurations

**Development:**
```bash
GROQ_API_KEY=gsk_dev_key_here
MONGODB_URI=mongodb://localhost:27017/agentic_swarm_dev
LOG_LEVEL=debug
WORKER_MODEL=llama-3.1-8b-instant  # Faster for quick iterations
```

**Production:**
```bash
GROQ_API_KEY=gsk_prod_key_here
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/agentic_swarm
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-prod?key=xxxxx
LOG_LEVEL=warn
ARCHITECT_MODEL=llama-3.3-70b-versatile
WORKER_MODEL=llama-3.3-70b-versatile
```

**Testing:**
```bash
GROQ_API_KEY=gsk_test_key_here
MONGODB_URI=mongodb://localhost:27017/agentic_swarm_test
LOG_LEVEL=error
# Leave RENDER_DEPLOY_HOOK empty to skip deployment in tests
```

### Obtaining Required Keys

**Groq API Key:**
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up (free tier available)
3. Navigate to "API Keys" section
4. Click "Create API Key"
5. Copy and save the key securely
6. Paste into `.env` file

**MongoDB Atlas (Free Tier):**
1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free M0 tier
3. Create a cluster (takes ~5 minutes)
4. Create database user and password
5. Whitelist your IP (or use 0.0.0.0/0 for all)
6. Get connection string from "Connect" button
7. Replace `<password>` with your database password

**Render Deploy Hook:**
1. Sign up at [https://render.com](https://render.com)
2. Create a new Web Service
3. Go to Settings → Deploy Hook
4. Copy the webhook URL
5. Paste into `.env` file

## Deployment Guide

### Deploying Frontend and Backend to Render.com from Same Repository

This guide covers deploying both frontend and backend applications to Render.com from the monorepo structure.

#### Prerequisites

- GitHub account with repository pushed
- Render.com account (free tier available)
- Code generated by the agentic swarm in `generated/` directory
- All tests passing

#### Option 1: Deploy as Separate Services (Recommended)

**Step 1: Prepare Frontend for Deployment**

1. Navigate to generated frontend:
```bash
cd generated/frontend
```

2. Create `render.yaml` in project root (or use Render dashboard):
```yaml
services:
  - type: web
    name: my-app-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: REACT_APP_API_URL
        value: https://my-app-backend.onrender.com
```

3. Push to GitHub:
```bash
git add generated/frontend
git commit -m "Add frontend application"
git push origin main
```

**Step 2: Deploy Frontend on Render**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `my-app-frontend`
   - **Root Directory**: `generated/frontend` (important!)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build` or `dist`
5. Click "Create Static Site"
6. Note the deployed URL (e.g., `https://my-app-frontend.onrender.com`)

**Step 3: Prepare Backend for Deployment**

1. Navigate to generated backend:
```bash
cd generated/backend
```

2. Update `package.json` to include start script:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "tsx src/server.ts"
  }
}
```

3. Create `render.yaml` (optional):
```yaml
services:
  - type: web
    name: my-app-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: MONGODB_URI
        sync: false
      - key: PORT
        value: 10000
```

**Step 4: Deploy Backend on Render**

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `my-app-backend`
   - **Root Directory**: `generated/backend` (important!)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: 10000 (Render's default)
   - `NODE_ENV`: production
   - `FRONTEND_URL`: `https://my-app-frontend.onrender.com` (for CORS)
6. Click "Create Web Service"
7. Note the deployed URL (e.g., `https://my-app-backend.onrender.com`)

**Step 5: Connect Frontend to Backend**

1. Update frontend environment variables on Render:
   - Go to frontend service → Environment
   - Add `REACT_APP_API_URL`: `https://my-app-backend.onrender.com`
   - Save and redeploy

2. Update backend CORS configuration:
```typescript
// In generated/backend/src/server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

3. Commit and push to trigger redeployment

#### Option 2: Monorepo Deployment with Build Scripts

For more control, you can deploy from the root with custom build scripts.

**Step 1: Create Root Build Scripts**

Add to root `package.json`:
```json
{
  "scripts": {
    "build:frontend": "cd generated/frontend && npm install && npm run build",
    "build:backend": "cd generated/backend && npm install && npm run build",
    "start:frontend": "cd generated/frontend && npm start",
    "start:backend": "cd generated/backend && npm start"
  }
}
```

**Step 2: Deploy Both Services**

1. **For Frontend:**
   - Root Directory: `/`
   - Build Command: `npm run build:frontend`
   - Publish Directory: `generated/frontend/build`

2. **For Backend:**
   - Root Directory: `/`
   - Build Command: `npm run build:backend`
   - Start Command: `npm run start:backend`

#### Option 3: Automated Deployment with Webhooks

Use the swarm's built-in deployment tool:

1. Set up deploy hook in `.env`:
```bash
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxxxx?key=xxxxx
```

2. Run swarm with deployment:
```bash
npm start "Create a todo app and deploy it to production"
```

3. The swarm will automatically:
   - Generate code
   - Run tests
   - Trigger deployment via webhook

#### Verifying Deployment

**Frontend checks:**
```bash
# Visit the frontend URL
open https://my-app-frontend.onrender.com

# Check build logs
# Render Dashboard → Frontend Service → Logs
```

**Backend checks:**
```bash
# Test API endpoint
curl https://my-app-backend.onrender.com/api/health

# Check server logs
# Render Dashboard → Backend Service → Logs

# Test database connection
curl https://my-app-backend.onrender.com/api/posts
```

#### Troubleshooting Deployment

**Frontend not loading:**
- Check build logs for errors
- Verify `REACT_APP_API_URL` points to correct backend
- Check browser console for CORS errors

**Backend API errors:**
- Verify `MONGODB_URI` is set correctly
- Check logs for connection errors
- Ensure MongoDB Atlas allows connections from Render IPs (0.0.0.0/0)
- Verify PORT is set to 10000

**CORS issues:**
- Update backend CORS configuration with frontend URL
- Ensure credentials are set correctly
- Check preflight OPTIONS requests

**Build failures:**
- Verify Node version (18 or higher)
- Check `package.json` has all dependencies
- Clear Render cache and redeploy

#### Continuous Deployment

Enable automatic deploys:

1. Go to Render Dashboard → Service → Settings
2. Under "Build & Deploy":
   - Enable "Auto-Deploy"
   - Select branch (e.g., `main`)
3. Push to GitHub triggers automatic deployment

#### Cost Optimization

**Free Tier Limits:**
- Frontend (Static Site): Free, unlimited
- Backend (Web Service): Free tier spins down after inactivity
- Database: Use MongoDB Atlas free tier (512MB)

**Preventing Spin-Down:**
- Upgrade to paid tier ($7/month)
- Or use an uptime monitor (e.g., UptimeRobot) to ping your service

#### Best Practices

1. **Environment Variables**: Never commit secrets, use Render's environment variable management
2. **Health Checks**: Add `/health` endpoint for monitoring
3. **Logging**: Use structured logging (e.g., Winston, Pino)
4. **Error Handling**: Implement global error handlers
5. **Database**: Use connection pooling and indexes
6. **Caching**: Implement caching for frequently accessed data
7. **Monitoring**: Set up Render's built-in monitoring or use external services

## Agents

### Architect Agent
- **Role**: Supervisor/Orchestrator
- **Responsibilities**:
  - Analyze user prompts
  - Break down into specific tasks
  - Route to specialized agents
  - Monitor progress and validate completion

### Frontend Agent
- **Role**: UI/Mobile-First React Developer
- **Expertise**:
  - React functional components
  - Tailwind CSS styling
  - Mobile-first responsive design
  - TypeScript

### Backend Agent
- **Role**: Node.js/Express Developer
- **Expertise**:
  - RESTful API design
  - Express.js
  - MongoDB/Mongoose
  - Authentication & authorization

### QA Agent
- **Role**: Quality Assurance & Testing
- **Expertise**:
  - Jest testing framework
  - Code validation
  - Bug detection
  - Test generation

## Configuration

See `.env.example` for all configuration options:

- `GROQ_API_KEY`: Required - Your Groq API key
- `MONGODB_URI`: Optional - MongoDB connection string
- `RENDER_DEPLOY_HOOK`: Optional - Render.com deployment webhook
- `ARCHITECT_MODEL`: Model to use (default: llama-3.3-70b-versatile)
- `LOG_LEVEL`: Logging verbosity (debug, info, warn, error)

## Development

### Project Structure (Swarm Core)

```
My_Agentic_Swarm/
├── src/
│   ├── agents/              # Agent implementations
│   │   ├── architect.ts     # Planning & orchestration
│   │   ├── frontend.ts      # React/Tailwind development
│   │   ├── backend.ts       # Node.js/Express APIs
│   │   └── qa.ts            # Testing & validation
│   ├── tools/               # Tool integrations
│   │   ├── mongodb.ts       # Database operations
│   │   ├── render-deploy.ts # Deployment automation
│   │   └── filesystem.ts    # File operations
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── swarm.ts             # Main orchestrator
│   └── index.ts             # Entry point
├── generated/               # Agent-generated code (gitignored)
│   ├── frontend/           # Generated React apps
│   └── backend/            # Generated Express apps
├── package.json            # Root dependencies
├── tsconfig.json           # TypeScript config
├── jest.config.cjs         # Jest configuration
├── .env.example            # Environment template
├── .npmrc                  # NPM configuration
└── README.md               # This file
```

### Available Scripts

```bash
# Build the swarm system
npm run build

# Run the swarm with a prompt
npm start "Your prompt here"

# Development mode with auto-reload
npm run dev "Your prompt here"

# Run tests
npm test

# Watch tests during development
npm run test:watch

# Lint the codebase
npm run lint

# Clean build artifacts
npm run clean
```

### Extending the Swarm

#### Adding a New Agent

1. Create agent file in `src/agents/`:
```typescript
// src/agents/devops.ts
import { BeeAgent } from 'beeai-framework';
import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';

export class DevOpsAgent {
  private agent: BeeAgent;

  constructor(llm: GroqChatModel) {
    this.agent = new BeeAgent({
      llm,
      name: 'DevOps Agent',
      description: 'Expert in Docker, Kubernetes, CI/CD',
      // Add tools and configuration
    });
  }

  async deployContainers(task: string): Promise<string> {
    // Implementation
  }
}
```

2. Register in `src/swarm.ts`:
```typescript
import { DevOpsAgent } from './agents/devops.js';

// In constructor
this.devopsAgent = new DevOpsAgent(llm);

// In executePrompt
case 'devops':
  result = await this.devopsAgent.deployContainers(task.description);
  break;
```

#### Adding a New Tool

1. Create tool file in `src/tools/`:
```typescript
// src/tools/docker.ts
export class DockerTool {
  async buildImage(dockerfile: string): Promise<string> {
    // Build Docker image
  }

  async pushToRegistry(imageName: string): Promise<string> {
    // Push to Docker Hub
  }
}
```

2. Integrate with agents:
```typescript
// In agent file
import { DockerTool } from '../tools/docker.js';

const dockerTool = new DockerTool();
const result = await dockerTool.buildImage(dockerfileContent);
```

#### Customizing Agent Behavior

Edit agent system prompts in `src/agents/`:

```typescript
// Example: Make frontend agent focus on accessibility
const systemPrompt = `
You are an expert React developer with deep knowledge of:
- Accessible components (WCAG 2.1 Level AA)
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility

Always prioritize accessibility in your implementations.
`;
```

### Testing Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npm test -- types.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode for TDD
npm run test:watch
```

### Debugging

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev "Your prompt"
```

Add breakpoints in TypeScript:
```typescript
// In any file
debugger; // Execution will pause here
```

Run with Node debugger:
```bash
node --inspect dist/index.js "Your prompt"
```

### Code Style

The project follows TypeScript best practices:
- Use `async/await` over callbacks
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Use TypeScript types, avoid `any`

Run linter:
```bash
npm run lint
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test -- src/__tests__/types.test.ts
```

### Test Structure

The project uses Jest for testing:

```typescript
// Example test
import { AgenticSwarm } from '../swarm';

describe('AgenticSwarm', () => {
  it('should initialize with valid config', () => {
    const config = {
      groqApiKey: 'test-key',
      modelName: 'llama-3.3-70b-versatile',
      maxRetries: 2,
      logLevel: 'info'
    };
    
    const swarm = new AgenticSwarm(config);
    expect(swarm).toBeDefined();
  });
});
```

### Testing Generated Code

After the swarm generates code:

**Frontend tests:**
```bash
cd generated/frontend
npm install
npm test
```

**Backend tests:**
```bash
cd generated/backend
npm install
npm test
```

**Integration tests:**
```bash
# Start backend
cd generated/backend
npm start &

# Run frontend tests against live backend
cd generated/frontend
REACT_APP_API_URL=http://localhost:5000 npm test
```

### Test Coverage

Aim for:
- Unit tests: 80%+ coverage
- Integration tests: Critical paths
- E2E tests: Key user workflows

### CI/CD Testing

The project can integrate with GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm test
```

## Contributing

Contributions are welcome! This project thrives on community involvement. Here's how you can contribute:

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/My_Agentic_Swarm.git
   cd My_Agentic_Swarm
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up development environment**
   ```bash
   npm install
   cp .env.example .env
   # Add your GROQ_API_KEY to .env
   npm run build
   ```

### Making Changes

1. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Use TypeScript types
   - Write descriptive commit messages

2. **Test your changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

3. **Test with real prompts**
   ```bash
   npm start "Test prompt for your feature"
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: description of your change"
   ```

### Contribution Guidelines

**Code Quality:**
- Write clean, readable code
- Follow TypeScript best practices
- Add JSDoc comments for public APIs
- Maintain test coverage above 80%
- Use meaningful variable and function names

**Testing:**
- Add tests for new functionality
- Ensure all existing tests pass
- Test edge cases and error scenarios
- Include integration tests where appropriate

**Documentation:**
- Update README.md if adding new features
- Add inline comments for complex logic
- Update SETUP.md for configuration changes
- Include usage examples

**Commit Messages:**
- Use clear, descriptive messages
- Follow conventional commits format:
  - `feat: Add new agent type`
  - `fix: Resolve MongoDB connection issue`
  - `docs: Update deployment guide`
  - `test: Add integration tests for QA agent`
  - `refactor: Improve error handling`

### Pull Request Process

1. **Update documentation**
   - README.md for user-facing changes
   - Code comments for implementation details
   - SETUP.md for configuration changes

2. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to GitHub and click "New Pull Request"
   - Provide a clear title and description
   - Reference any related issues
   - List changes made
   - Include screenshots for UI changes

4. **Address review feedback**
   - Respond to comments
   - Make requested changes
   - Push updates to your branch

5. **Merge**
   - Once approved, your PR will be merged
   - Delete your feature branch

### Areas for Contribution

**High Priority:**
- Additional agent types (DevOps, Testing, Security)
- More tool integrations (GitHub, Jira, Slack)
- Enhanced error handling and recovery
- Performance optimizations
- Better logging and debugging tools

**Medium Priority:**
- UI/CLI improvements
- Additional deployment targets (Vercel, Netlify, AWS)
- Template system for common patterns
- Agent personality customization
- Cost tracking for API usage

**Good First Issues:**
- Documentation improvements
- Example prompts and use cases
- Bug fixes
- Test coverage improvements
- Code cleanup and refactoring

### Bug Reports

Found a bug? Please open an issue with:

1. **Clear title**: "Bug: Description of the issue"
2. **Description**: What happened vs. what you expected
3. **Steps to reproduce**:
   ```
   1. Run `npm start "..."`
   2. See error
   ```
4. **Environment**:
   - Node.js version
   - OS (macOS, Linux, Windows)
   - Relevant configuration (`.env` settings)
5. **Logs**: Include error messages and stack traces
6. **Screenshots**: If applicable

### Feature Requests

Have an idea? Open an issue with:

1. **Clear title**: "Feature: Description of the feature"
2. **Problem**: What problem does this solve?
3. **Proposed solution**: How should it work?
4. **Alternatives**: Other approaches you considered
5. **Use cases**: Example scenarios where this would be useful

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's contribution guidelines
- Report inappropriate behavior to maintainers

### Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review the SETUP.md for detailed instructions

Thank you for contributing to My Agentic Swarm! 🐝

## Troubleshooting

### Common Issues

#### 1. "GROQ_API_KEY not found"

**Problem**: Environment variable not loaded.

**Solution:**
```bash
# Verify .env file exists
ls -la .env

# Check content
cat .env | grep GROQ_API_KEY

# If missing, copy from example and add your key
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=gsk_your_actual_key_here

# Restart your terminal/IDE after changing .env
```

#### 2. MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB database.

**Solution:**
```bash
# For local MongoDB, verify it's running
mongosh
# Should connect successfully

# Check connection string format in .env
# Local: MONGODB_URI=mongodb://localhost:27017/agentic_swarm
# Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# For MongoDB Atlas:
# - Ensure your IP is whitelisted (or use 0.0.0.0/0)
# - Verify username and password are correct
# - Check network access in Atlas dashboard

# If not needed, comment out in .env:
# MONGODB_URI=
```

#### 3. Build Errors

**Problem**: TypeScript compilation fails.

**Solution:**
```bash
# Clean and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build

# Check Node version (must be 18+)
node --version

# Update TypeScript if needed
npm install -D typescript@latest
```

#### 4. Module Not Found Errors

**Problem**: Cannot find installed modules.

**Solution:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Ensure .npmrc is present (for legacy-peer-deps)
cat .npmrc

# If missing, create it:
echo "legacy-peer-deps=true" > .npmrc
npm install
```

#### 5. Groq API Rate Limits

**Symptoms:**
- "Too many requests" errors
- 429 status codes
- Slow responses

**Solution:**
```bash
# Free tier limits:
# - 30 requests per minute
# - 14,400 requests per day

# Solutions:
# 1. Wait a few minutes between requests
# 2. Use a lighter model for workers:
#    WORKER_MODEL=llama-3.1-8b-instant
# 3. Reduce maxRetries in config
# 4. Upgrade to paid Groq tier for higher limits
```

#### 6. Agent Timeouts

**Problem**: Agent takes too long and times out.

**Solution:**
```bash
# Simplify your prompt
# Instead of: "Create a full social media platform..."
# Try: "Create a user profile page with React"

# Break complex requests into smaller tasks
npm start "Create React components for user profile"
npm start "Create Express API for user data"

# Increase timeout in code (if needed)
# Edit src/swarm.ts and adjust maxIterations
```

#### 7. Generated Code Not Working

**Problem**: Generated frontend/backend has errors.

**Solution:**
```bash
# Check the generated code
cd generated/frontend
npm install
npm run build

# Look for errors in dependencies
# Check package.json for missing packages

# Re-run the swarm with more specific instructions
npm start "Fix the authentication bug in the user login form"

# Enable debug logging to see what's happening
LOG_LEVEL=debug npm run dev "Your prompt"
```

#### 8. Deployment Failures on Render

**Problem**: Deployment to Render.com fails.

**Solution:**
```bash
# Check Render logs in dashboard
# Common issues:

# 1. Wrong root directory
#    Set: generated/frontend or generated/backend

# 2. Missing environment variables
#    Add: MONGODB_URI, PORT, NODE_ENV

# 3. Build command errors
#    Ensure: npm install && npm run build

# 4. Node version mismatch
#    Set NODE_VERSION=18 in environment variables

# 5. Port issues
#    Backend must use process.env.PORT || 10000
```

#### 9. CORS Errors in Deployed App

**Problem**: Frontend cannot connect to backend API.

**Solution:**
```bash
# Update backend CORS configuration
# In generated/backend/src/server.ts:

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.onrender.com'
  ],
  credentials: true
}));

# Update frontend API URL
# In Render dashboard → Frontend → Environment:
# REACT_APP_API_URL=https://your-backend.onrender.com

# Redeploy both services
```

#### 10. Tests Failing

**Problem**: Jest tests fail after changes.

**Solution:**
```bash
# Run tests with verbose output
npm test -- --verbose

# Check specific test file
npm test -- src/__tests__/types.test.ts

# Clear Jest cache
npx jest --clearCache
npm test

# Update snapshots if needed
npm test -- -u

# Ensure all dependencies are installed
npm install
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Set in .env
LOG_LEVEL=debug

# Run with debug output
npm run dev "Your prompt"

# Or run directly with env variable
LOG_LEVEL=debug npm start "Your prompt"
```

This will show:
- Architect's task breakdown
- Each agent's execution steps
- Tool invocations and results
- LLM prompts and responses
- Error stack traces

### Testing Individual Components

Test components in isolation:

```bash
# Test file system tool
node -e "
import('./dist/tools/filesystem.js').then(({ FileSystemTool }) => {
  const tool = new FileSystemTool();
  tool.execute({ type: 'read', path: 'package.json' })
    .then(console.log);
});
"

# Test Groq connection
node -e "
import('./dist/swarm.js').then(({ AgenticSwarm }) => {
  const config = {
    groqApiKey: process.env.GROQ_API_KEY,
    modelName: 'llama-3.3-70b-versatile',
    maxRetries: 2,
    logLevel: 'debug'
  };
  console.log('Groq connection test passed');
});
"
```

### Performance Issues

If the swarm is slow:

1. **Use faster models:**
   ```bash
   # In .env
   WORKER_MODEL=llama-3.1-8b-instant
   ```

2. **Reduce max iterations:**
   ```typescript
   // In src/swarm.ts
   maxIterations: 5  // Default is 10
   ```

3. **Simplify prompts:**
   - Break into smaller, focused tasks
   - Be specific about requirements
   - Avoid vague or ambiguous requests

4. **Check network:**
   - Ensure stable internet connection
   - Groq API requires good connectivity
   - Consider regional latency

### Getting Help

If issues persist:

1. **Check documentation:**
   - README.md (this file)
   - SETUP.md (detailed setup guide)
   - Code comments in `src/`

2. **Search existing issues:**
   - [GitHub Issues](https://github.com/mohitkesarwani/My_Agentic_Swarm/issues)
   - Look for similar problems
   - Check closed issues for solutions

3. **Open a new issue:**
   Include:
   - Error message and stack trace
   - Steps to reproduce
   - Environment details (Node version, OS)
   - Relevant logs (with LOG_LEVEL=debug)
   - Your .env configuration (without sensitive keys)

4. **Enable debug logging:**
   ```bash
   LOG_LEVEL=debug npm run dev "Your prompt" 2>&1 | tee debug.log
   ```
   Share `debug.log` in your issue

### Best Practices to Avoid Issues

1. **Always use .env file** - Never hardcode API keys
2. **Keep dependencies updated** - Run `npm update` regularly
3. **Test locally first** - Before deploying to production
4. **Use clear prompts** - Specific requests get better results
5. **Start simple** - Test with small prompts before complex ones
6. **Monitor usage** - Track Groq API rate limits
7. **Review generated code** - Don't blindly deploy AI output
8. **Backup your work** - Commit to Git frequently

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [IBM Bee Agent Framework](https://github.com/i-am-bee/bee-agent-framework)
- Powered by [Groq](https://groq.com) LLM infrastructure
- Uses [Llama 3.3-70B](https://www.llama.com/) model

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [SETUP.md](SETUP.md) for detailed setup instructions

---

Built with 🐝 by the Agentic Swarm
