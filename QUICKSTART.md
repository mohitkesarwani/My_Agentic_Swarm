# Quick Start Guide - Agentic Swarm POC

This guide will get you up and running with the Agentic Swarm POC in under 5 minutes.

## Prerequisites

- Node.js 22+
- pnpm 9.15.4+
- Docker (for MongoDB)

## Quick Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and set the required variables:
- `GROQ_API_KEY` - Get from https://console.groq.com
- Other defaults should work for local development

### 3. Start Services

**Terminal 1 - MongoDB:**
```bash
docker run -d -p 27017:27017 --name agentic-mongo mongo:7
```

**Terminal 2 - API Server:**
```bash
cd apps/api
pnpm dev
```
API will run on `http://localhost:3001`

**Terminal 3 - Web App:**
```bash
cd apps/web
pnpm dev
```
Web app will run on `http://localhost:5173`

### 4. Use the System

1. Open `http://localhost:5173` in your browser
2. Click "Register" and create an account
3. Create a new project
4. Submit a build request like: "Build me a blog app with user accounts and comments"
5. Watch the build progress in real-time!

## What You Can Do

✅ **Register/Login** - Create your account
✅ **Create Projects** - Organize your builds
✅ **Submit Build Requests** - Natural language requirements
✅ **Track Progress** - See agent activities in real-time
✅ **View Logs** - Detailed build logs and output
✅ **Monitor Agents** - See which agents are working

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│             │         │             │         │              │
│  React Web  │────────▶│  Fastify    │────────▶│  MongoDB     │
│  (Port 5173)│         │  API        │         │  (Port 27017)│
│             │◀────────│  (Port 3001)│◀────────│              │
└─────────────┘         └─────────────┘         └──────────────┘
                              │
                              │ spawns
                              ▼
                        ┌──────────────┐
                        │              │
                        │ Orchestrator │
                        │   (Enhanced) │
                        │              │
                        └──────────────┘
                              │
                        ┌─────┴─────┐
                        │           │
                    ┌───▼──┐    ┌──▼───┐
                    │ Agent│    │ Agent│
                    │  1   │    │  2   │
                    └──────┘    └──────┘
```

## Key Features

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Token stored in localStorage

### Project Management
- Create/list/view/delete projects
- Each project can have multiple builds
- Organized workspace per build

### Build Tracking
- Real-time status updates (polling every 3-5s)
- Detailed logs in terminal-style viewer
- Agent activity timeline
- Artifact tracking
- Error reporting

### Security
- Input validation with Zod
- CORS protection
- Rate limiting
- Authorization checks
- No vulnerabilities (CodeQL verified)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Projects
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `DELETE /api/v1/projects/:id` - Delete project

### Builds
- `POST /api/v1/projects/:projectId/build` - Submit build request
- `GET /api/v1/projects/:projectId/builds/:buildId` - Get build details

## Example Build Request

```
Prompt: Build me a blog app with user accounts and comments

The orchestrator will:
1. Parse requirements
2. Create agent tasks:
   - Backend API setup
   - Database schema design
   - Frontend components
   - Security review
   - QA validation
3. Execute tasks in order
4. Generate working code
5. Track all activities
```

## Troubleshooting

### Build fails immediately
- Check `GROQ_API_KEY` is set in `.env`
- Verify API server is running
- Check orchestrator logs

### Can't login
- Ensure MongoDB is running: `docker ps`
- Check API is accessible: `curl http://localhost:3001/health`
- Verify CORS settings in `.env`

### UI not updating
- Check browser console for errors
- Verify API token is valid
- Clear localStorage and login again

### MongoDB connection error
- Ensure Docker container is running
- Check `MONGODB_URI` in `.env`
- Try restarting MongoDB container

## Development Commands

```bash
# Build all packages
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

## File Structure

```
My_Agentic_Swarm/
├── apps/
│   ├── api/              # Fastify REST API
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── models/   # MongoDB models
│   │   │   ├── services/ # Business logic
│   │   │   └── middleware/
│   │   └── package.json
│   └── web/              # React web app
│       ├── src/
│       │   ├── screens/  # Page components
│       │   ├── contexts/ # React contexts
│       │   └── api/      # API client
│       └── package.json
├── packages/
│   └── shared/           # Shared TypeScript types
├── tools/
│   └── orchestrator/     # Build orchestrator
└── docs/
    └── SYSTEM_GUIDE.md   # Comprehensive guide
```

## Next Steps

1. Read the [comprehensive system guide](./docs/SYSTEM_GUIDE.md)
2. Try submitting different build requests
3. Explore the code in `apps/api` and `apps/web`
4. Check out the orchestrator in `tools/orchestrator`
5. Contribute improvements!

## Need Help?

- Check `docs/SYSTEM_GUIDE.md` for detailed information
- Review `ONBOARDING.md` for more setup details
- Look at example build requests in `examples/`

## What's Next?

The POC currently supports:
- ✅ Authentication and project management
- ✅ Build request submission
- ✅ Real-time build tracking
- ✅ Agent activity monitoring

Coming soon:
- 🔄 WebSocket for true real-time updates
- 🔄 Live demo environment (run generated apps in browser)
- 🔄 Product increment workflow (enhance existing solutions)
- 🔄 Better UI/UX with animations

Happy building! 🚀
