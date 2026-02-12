# Agentic Swarm Platform - Local Onboarding Guide

Welcome to the Agentic Swarm platform! This guide will walk you through setting up your local environment, registering your first user, and submitting your first build request.

> **💡 Quick Tip**: We provide convenient bash scripts in the `examples/` directory to automate common operations. See [examples/README.md](./examples/README.md) for quick-start scripts.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Clone and Install](#step-1-clone-and-install)
3. [Step 2: Environment Configuration](#step-2-environment-configuration)
4. [Step 3: Start All Services](#step-3-start-all-services)
5. [Step 4: Register Your First User](#step-4-register-your-first-user)
6. [Step 5: Login and Obtain JWT Token](#step-5-login-and-obtain-jwt-token)
7. [Step 6: Create a Project](#step-6-create-a-project)
8. [Step 7: Submit Your First Build Request](#step-7-submit-your-first-build-request)
9. [Step 8: Check Build Status](#step-8-check-build-status)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22 or higher
  ```bash
  node --version  # Should be 22.x.x or higher
  ```

- **pnpm**: Version 9.15.4 or higher
  ```bash
  npm install -g pnpm
  pnpm --version  # Should be 9.15.4 or higher
  ```

- **Docker**: For running MongoDB and containerized services
  ```bash
  docker --version
  docker compose version
  ```

- **Git**: For cloning the repository
  ```bash
  git --version
  ```

---

## Step 1: Clone and Install

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/mohitkesarwani/My_Agentic_Swarm.git
cd My_Agentic_Swarm

# Install all workspace dependencies
pnpm install
```

This will install dependencies for all packages in the monorepo (API, Web, shared packages, tools).

---

## Step 2: Environment Configuration

Create a `.env` file in the root directory with your configuration:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and configure the following required variables:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agentic_swarm

# API Server
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=development

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173

# JWT Authentication (IMPORTANT: Change in production!)
JWT_SECRET=change-me-in-production-use-long-random-string
JWT_ISSUER=agentic-swarm
JWT_AUDIENCE=agentic-swarm-api
JWT_EXPIRY=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Logging
LOG_LEVEL=info

# Groq API (REQUIRED for build requests)
GROQ_API_KEY=your_groq_api_key_here

# Agent Configuration
ARCHITECT_MODEL=llama-3.3-70b-versatile
WORKER_MODEL=llama-3.3-70b-versatile
```

**Important Notes:**
- **GROQ_API_KEY**: Required for the orchestrator to process build requests. Get your API key from [Groq Cloud](https://console.groq.com/)
- **JWT_SECRET**: Use a long, random string in production (e.g., generate with `openssl rand -base64 64`)

---

## Step 3: Start All Services

You have two options for starting services:

### Option A: Docker Compose (Recommended for First-Time Setup)

This starts MongoDB, API, and Web UI in containers:

```bash
# Start all services with Docker Compose
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Check service status
docker compose -f infrastructure/docker/docker-compose.yml ps

# View logs
docker compose -f infrastructure/docker/docker-compose.yml logs -f
```

**Services will be available at:**
- **MongoDB**: `localhost:27017`
- **API Server**: `http://localhost:3001`
- **Web UI**: `http://localhost:5173`

### Option B: Local Development Mode

Run services locally (requires local MongoDB):

```bash
# Start MongoDB separately
docker run -d -p 27017:27017 --name mongo-dev mongo:7

# Start API and Web in dev mode with hot-reload
pnpm dev
```

**Verify Services are Running:**

```bash
# Check API health
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","version":"1.0.0","timestamp":"2024-...","uptime":...}

# Check Web UI
# Open browser: http://localhost:5173
# You should see "Agentic Swarm" with API health status
```

---

## Step 4: Register Your First User

> **Note**: The Web UI currently only has a health check screen. Registration is done via API. A registration UI will be added in the future.

### Option A: Using the Example Script (Recommended)

We provide a convenient script for registration:

```bash
./examples/register-user.sh "John Doe" "john@example.com" "SecurePass123!"
```

This script handles validation, makes the API call, and saves your token automatically.

### Option B: Manual Registration via curl

Register a new user account using the API:

```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- Maximum 100 characters
- No specific complexity requirements (but strong passwords recommended!)

**Verify User in Database (Optional):**

```bash
# Connect to MongoDB
docker exec -it <mongo-container-id> mongosh agentic_swarm

# Or if running locally:
mongosh agentic_swarm

# Query users
db.users.find().pretty()

# You should see your newly created user
# Note: passwordHash is bcrypt-hashed, never stored in plain text
```

**Common Registration Errors:**
- **409 Conflict**: User with this email already exists
- **400 Bad Request**: Validation error (check email format, password length)
- **503 Service Unavailable**: Database connection issue

---

## Step 5: Login and Obtain JWT Token

### Option A: Using the Example Script (Recommended)

```bash
./examples/login-user.sh "john@example.com" "SecurePass123!"
```

The script automatically saves your token to `token.txt` for use in subsequent commands.

### Option B: Manual Login via curl

Login with your credentials to get a fresh JWT token:

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzhjZjE2YjM4YTQ0YTAwMTI1NjAwMTIiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MzcyNDE0NTEsImV4cCI6MTczNzg0NjI1MX0.abc123...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Save the token** - you'll need it for authenticated requests:

```bash
# Save token to environment variable (Linux/Mac)
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Or save to file
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." > token.txt
```

**Verify Token Works:**

```bash
curl http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected response: Your user profile
```

**Common Login Errors:**
- **401 Unauthorized**: Invalid email or password
- **400 Bad Request**: Validation error (check email format)

---

## Step 6: Create a Project

Before submitting build requests, you need to create a project:

### Option A: Using the Example Script (Recommended)

```bash
./examples/create-project.sh "$(cat token.txt)" "My First Project" "Testing the Agentic Swarm platform"
```

The script automatically saves your project ID to `project-id.txt`.

### Option B: Manual Project Creation via curl

```bash
curl -X POST http://localhost:3001/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My First Project",
    "description": "Testing the Agentic Swarm platform"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "My First Project",
    "description": "Testing the Agentic Swarm platform",
    "userId": "507f1f77bcf86cd799439011",
    "buildRequests": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Save the project ID:**

```bash
export PROJECT_ID="507f1f77bcf86cd799439012"
```

**List Your Projects:**

```bash
curl http://localhost:3001/v1/projects \
  -H "Authorization: Bearer $TOKEN"
```

---

## Step 7: Submit Your First Build Request

Now you can submit a build request to the orchestrator:

### Option A: Using the Example Script (Recommended)

```bash
./examples/submit-build.sh "$(cat token.txt)" "$(cat project-id.txt)" \
  "Create a simple todo list API with endpoints for creating, listing, updating, and deleting todos. Use TypeScript and include input validation."
```

The script automatically saves your build request ID to `build-id.txt`.

### Option B: Manual Build Submission via curl

```bash
curl -X POST http://localhost:3001/v1/projects/$PROJECT_ID/build \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "Create a simple todo list API with endpoints for creating, listing, updating, and deleting todos. Use TypeScript and include input validation."
  }'
```

**Expected Response (202 Accepted):**
```json
{
  "data": {
    "buildRequestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "pending",
    "message": "Build request accepted and queued for processing"
  }
}
```

**Build Request Flow:**
1. **PENDING**: Request accepted and queued
2. **RUNNING**: Orchestrator is processing the request
3. **COMPLETED**: Build finished successfully
4. **FAILED**: Build encountered an error

**Common Build Request Errors:**
- **404 Not Found**: Project doesn't exist or doesn't belong to you
- **503 Service Unavailable**: GROQ_API_KEY is not configured
- **401 Unauthorized**: Invalid or expired token

---

## Step 8: Check Build Status

Monitor your build request status:

### Option A: Using the Example Script (Recommended)

```bash
./examples/check-build-status.sh "$(cat token.txt)" "$(cat project-id.txt)" "$(cat build-id.txt)"
```

The script provides color-coded status output and shows staging path when completed.

### Option B: Manual Status Check via curl

```bash
# Save the build ID from the response
export BUILD_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Check status
curl http://localhost:3001/v1/projects/$PROJECT_ID/builds/$BUILD_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Response (Running):**
```json
{
  "data": {
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "prompt": "Create a simple todo list API...",
    "status": "running",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "completedAt": null,
    "stagingPath": null,
    "error": null
  }
}
```

**Response (Completed):**
```json
{
  "data": {
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "prompt": "Create a simple todo list API...",
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:01:30.000Z",
    "stagingPath": "solutions/users/507f1f77bcf86cd799439011/projects/507f1f77bcf86cd799439012/builds/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "error": null
  }
}
```

**Check Generated Solution:**

Once completed, you can view the generated code in the `stagingPath`:

```bash
ls -la solutions/users/<userId>/projects/<projectId>/builds/<buildId>/
```

The orchestrator generates:
- Architecture Decision Records (ADRs)
- Implementation code
- Tests
- Documentation

**Verify Project Build Requests:**

```bash
curl http://localhost:3001/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# This shows the project with all its build requests
```

---

## Quick Start with Example Scripts

For a streamlined onboarding experience, you can use our example scripts to complete the entire flow:

```bash
# Start services
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Wait for services to be ready
sleep 10

# Register a new user
./examples/register-user.sh "John Doe" "john@example.com" "SecurePass123!"

# Login (saves token to token.txt)
./examples/login-user.sh "john@example.com" "SecurePass123!"

# Create a project (saves project ID to project-id.txt)
./examples/create-project.sh "$(cat token.txt)" "My First Project" "Testing the platform"

# Submit a build request (saves build ID to build-id.txt)
./examples/submit-build.sh "$(cat token.txt)" "$(cat project-id.txt)" \
  "Create a simple REST API for managing todos with CRUD operations"

# Check build status
./examples/check-build-status.sh "$(cat token.txt)" "$(cat project-id.txt)" "$(cat build-id.txt)"
```

See [examples/README.md](./examples/README.md) for detailed documentation on all available scripts.

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Services Won't Start

**Problem**: Docker Compose fails to start services

**Solutions**:
```bash
# Check Docker is running
docker ps

# Check for port conflicts
lsof -i :27017  # MongoDB
lsof -i :3001   # API
lsof -i :5173   # Web

# Stop conflicting services or change ports in .env

# View detailed logs
docker compose -f infrastructure/docker/docker-compose.yml logs api
docker compose -f infrastructure/docker/docker-compose.yml logs mongo

# Restart services
docker compose -f infrastructure/docker/docker-compose.yml down
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

#### 2. API Health Check Fails

**Problem**: `curl http://localhost:3001/health` returns connection refused

**Solutions**:
```bash
# Check if API container is running
docker compose -f infrastructure/docker/docker-compose.yml ps

# Check API logs for errors
docker compose -f infrastructure/docker/docker-compose.yml logs api

# Common causes:
# - MongoDB not ready (wait for health check to pass)
# - Missing environment variables
# - Port already in use

# Verify MongoDB is healthy
docker compose -f infrastructure/docker/docker-compose.yml ps mongo
# Should show "healthy" status
```

#### 3. Cannot Register User

**Problem**: Registration returns 500 Internal Server Error

**Solutions**:
```bash
# Check API logs
docker compose -f infrastructure/docker/docker-compose.yml logs api

# Common causes:
# a) MongoDB connection failed
#    - Verify MONGODB_URI in .env
#    - Check mongo container is running and healthy

# b) Validation error
#    - Email must be valid format
#    - Password must be at least 8 characters
#    - Name is required

# c) Database error
#    - Check MongoDB logs
#    docker compose -f infrastructure/docker/docker-compose.yml logs mongo
```

**Problem**: Registration returns 409 Conflict

**Solution**: User already exists. Try a different email or login with existing credentials.

#### 4. Cannot Login

**Problem**: Login returns 401 Unauthorized

**Solutions**:
```bash
# Verify user exists in database
docker exec -it $(docker compose -f infrastructure/docker/docker-compose.yml ps -q mongo) mongosh agentic_swarm
db.users.find({ email: "john@example.com" }).pretty()

# Common causes:
# a) Wrong email or password
#    - Passwords are case-sensitive
#    - Check for typos

# b) User doesn't exist
#    - Register first

# c) JWT configuration issue
#    - Verify JWT_SECRET is set in .env
```

#### 5. JWT Token Invalid or Expired

**Problem**: Authenticated requests return 401 Unauthorized

**Solutions**:
```bash
# Check token format
echo $TOKEN
# Should start with "eyJ..."

# Verify token hasn't expired (default: 7 days)
# Login again to get a fresh token

curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Update TOKEN variable
export TOKEN="<new-token>"
```

#### 6. Build Request Returns 503 Service Unavailable

**Problem**: "Swarm engine not configured. GROQ_API_KEY is missing."

**Solutions**:
```bash
# Add GROQ_API_KEY to .env
echo "GROQ_API_KEY=your_actual_key_here" >> .env

# Restart API service
docker compose -f infrastructure/docker/docker-compose.yml restart api

# Verify environment variable is loaded
docker compose -f infrastructure/docker/docker-compose.yml exec api env | grep GROQ

# Get a free API key from:
# https://console.groq.com/
```

#### 7. Build Request Stuck in PENDING Status

**Problem**: Build never transitions from PENDING to RUNNING

**Solutions**:
```bash
# Check API logs for background execution errors
docker compose -f infrastructure/docker/docker-compose.yml logs api

# Common causes:
# a) GROQ_API_KEY invalid or rate-limited
#    - Verify key is correct
#    - Check Groq API status

# b) Orchestrator error
#    - Check logs for stack traces
#    - Verify all agent dependencies are installed

# c) Background process crashed
#    - Restart API service
```

#### 8. Cannot Connect to Web UI

**Problem**: `http://localhost:5173` doesn't load

**Solutions**:
```bash
# Check if Web container is running
docker compose -f infrastructure/docker/docker-compose.yml ps web

# Check Web logs
docker compose -f infrastructure/docker/docker-compose.yml logs web

# Verify port is not in use
lsof -i :5173

# Check VITE_API_URL is correct
docker compose -f infrastructure/docker/docker-compose.yml exec web env | grep VITE

# Restart web service
docker compose -f infrastructure/docker/docker-compose.yml restart web
```

#### 9. CORS Errors in Browser

**Problem**: Browser shows CORS policy errors when calling API

**Solutions**:
```bash
# Update CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:5173

# Restart API service
docker compose -f infrastructure/docker/docker-compose.yml restart api

# For development, you can allow all origins (NOT for production):
CORS_ORIGINS=*
```

#### 10. MongoDB Connection Issues

**Problem**: API can't connect to MongoDB

**Solutions**:
```bash
# Check MongoDB is running and healthy
docker compose -f infrastructure/docker/docker-compose.yml ps mongo

# Test MongoDB connection
docker compose -f infrastructure/docker/docker-compose.yml exec mongo mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker compose -f infrastructure/docker/docker-compose.yml logs mongo

# Verify MONGODB_URI in .env
# For Docker Compose: mongodb://mongo:27017/agentic_swarm
# For local: mongodb://localhost:27017/agentic_swarm

# Reset MongoDB (WARNING: Deletes all data)
docker compose -f infrastructure/docker/docker-compose.yml down -v
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

#### 11. Permission Denied Errors

**Problem**: Docker or file system permission errors

**Solutions**:
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Fix solution directory permissions
sudo chown -R $USER:$USER solutions/

# Check Docker Compose permissions
ls -la infrastructure/docker/
```

#### 12. Fresh Start / Reset Everything

If you want to start completely fresh:

```bash
# Stop all services
docker compose -f infrastructure/docker/docker-compose.yml down -v

# Clean workspace
pnpm clean
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Remove generated solutions
rm -rf solutions/users/

# Reinstall dependencies
pnpm install

# Start services
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Verify everything is working
curl http://localhost:3001/health
```

---

## Next Steps

After completing this onboarding:

1. **Explore the API**: Review the API documentation in `docs/api/`
2. **Read the Architecture**: Check `README.md` and Architecture Decision Records
3. **Understand the Orchestrator**: Learn how specialist agents work in `tools/orchestrator/`
4. **Review Security**: Read `docs/api/security-checklist.md`
5. **Explore Knowledge Base**: Check engineering standards in `knowledge-base/`

**Future UI Features** (Coming Soon):
- Registration and login screens
- Dashboard for viewing projects and builds
- Build request submission form
- Real-time build status updates
- Solution preview and download

---

## Additional Resources

- **Repository**: https://github.com/mohitkesarwani/My_Agentic_Swarm
- **API Conventions**: `docs/api/conventions.md`
- **Security Checklist**: `docs/api/security-checklist.md`
- **Threat Model**: `docs/threat-model.md`
- **Knowledge Base**: `knowledge-base/README.md`

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check the API logs: `docker compose -f infrastructure/docker/docker-compose.yml logs api`
2. Check the MongoDB logs: `docker compose -f infrastructure/docker/docker-compose.yml logs mongo`
3. Search for similar issues in the repository
4. Create a detailed bug report with logs and steps to reproduce

**Happy Building! 🚀**
