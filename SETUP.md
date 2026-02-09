# Setup and Deployment Guide

Complete setup instructions for My Agentic Swarm multi-agent system.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Swarm](#running-the-swarm)
5. [MongoDB Setup](#mongodb-setup)
6. [Deployment](#deployment)
7. [Advanced Configuration](#advanced-configuration)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Required
- Node.js version 18.0.0 or higher
- npm or yarn package manager
- Groq API key (free tier available)

### Optional
- MongoDB instance (local or cloud)
- Render.com account for deployment
- Git for version control

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/mohitkesarwani/My_Agentic_Swarm.git
cd My_Agentic_Swarm
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- IBM Bee Agent Framework
- Groq SDK
- Mongoose
- TypeScript and build tools

### Step 3: Build the Project

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` directory.

## Configuration

### Step 1: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` with your settings:

```bash
# Required: Get from https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Optional: For database operations
MONGODB_URI=mongodb://localhost:27017/agentic_swarm

# Optional: For automatic deployment
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxxxx?key=xxxxx

# Agent Configuration (defaults shown)
ARCHITECT_MODEL=llama-3.3-70b-versatile
WORKER_MODEL=llama-3.3-70b-versatile

# Logging level: debug, info, warn, error
LOG_LEVEL=info
```

### Step 3: Obtain Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in (free tier available)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

The free tier includes:
- 30 requests per minute
- 14,400 requests per day
- Access to Llama 3.3-70B model

## Running the Swarm

### Basic Usage

Run with a development prompt:

```bash
npm start "Your development request here"
```

### Development Mode

Use `dev` script for auto-reload during development:

```bash
npm run dev "Create a React component"
```

### Example Commands

1. **Frontend Development:**
```bash
npm start "Create a responsive navigation bar with React and Tailwind CSS"
```

2. **Backend Development:**
```bash
npm start "Build a REST API endpoint for user registration with validation"
```

3. **Full-Stack Application:**
```bash
npm start "Create a blog application with React frontend, Express backend, and MongoDB"
```

4. **Testing Focus:**
```bash
npm start "Write comprehensive Jest tests for the user authentication module"
```

## MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB:**

```bash
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

2. **Start MongoDB:**

```bash
# macOS/Linux
brew services start mongodb-community
# or
mongod --dbpath /path/to/data

# Windows
net start MongoDB
```

3. **Configure Connection:**

In `.env`:
```
MONGODB_URI=mongodb://localhost:27017/agentic_swarm
```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account:**
   - Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster:**
   - Choose free M0 tier
   - Select your region
   - Create cluster

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Configure in `.env`:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agentic_swarm?retryWrites=true&w=majority
```

### Option 3: Skip MongoDB

If you don't need database operations, simply leave `MONGODB_URI` empty or commented out in `.env`. The backend agent will work without it for file-based operations.

## Deployment

### Deploying to Render.com

#### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Create Render Service

1. Visit [https://render.com](https://render.com)
2. Sign up or log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: my-agentic-swarm
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

#### Step 3: Add Environment Variables

In Render dashboard, add environment variables:
- `GROQ_API_KEY`: Your Groq API key
- `MONGODB_URI`: Your MongoDB connection string
- `LOG_LEVEL`: info

#### Step 4: Get Deploy Hook

1. Go to Settings → Deploy Hook
2. Copy the webhook URL
3. Add to your `.env` for local testing:
```
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxxxx?key=xxxxx
```

#### Step 5: Deploy

Click "Manual Deploy" or push to GitHub to trigger automatic deployment.

### Alternative Deployment Options

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create my-agentic-swarm

# Set environment variables
heroku config:set GROQ_API_KEY=your_key_here

# Deploy
git push heroku main
```

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

#### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t my-agentic-swarm .
docker run -e GROQ_API_KEY=your_key_here -p 3000:3000 my-agentic-swarm
```

## Advanced Configuration

### Custom Agent Models

You can specify different models for different agents:

```bash
# In .env
ARCHITECT_MODEL=llama-3.3-70b-versatile
WORKER_MODEL=llama-3.1-8b-instant  # Faster, less capable
```

Available Groq models:
- `llama-3.3-70b-versatile` (Recommended, most capable)
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant` (Faster, smaller context)
- `mixtral-8x7b-32768`

### Logging Configuration

Set different log levels for different environments:

```bash
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=warn
```

### Custom Base Path

For running agents in a specific directory:

```typescript
// In src/index.ts
const swarm = new AgenticSwarm(
  config,
  '/path/to/your/project',  // Custom base path
  mongoUri,
  deployConfig
);
```

### Retry Configuration

Adjust retry behavior in `src/index.ts`:

```typescript
const config: SwarmConfig = {
  maxRetries: 3,  // Increase for more resilience
  logLevel: 'info',
  groqApiKey,
  modelName: 'llama-3.3-70b-versatile',
};
```

## Troubleshooting

### Common Issues

#### 1. "GROQ_API_KEY not found"

**Solution:**
- Verify `.env` file exists in project root
- Check that `GROQ_API_KEY` is set correctly
- Restart your terminal/IDE after changing `.env`

#### 2. MongoDB Connection Errors

**Solution:**
- Verify MongoDB is running: `mongosh` (should connect)
- Check connection string format
- Ensure network access for MongoDB Atlas
- Try without MongoDB if not needed

#### 3. Build Errors

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### 4. Module Not Found Errors

**Solution:**
```bash
# Ensure all dependencies are installed
rm -rf node_modules package-lock.json
npm install
```

#### 5. Groq API Rate Limits

**Symptoms:**
- "Too many requests" errors
- 429 status codes

**Solution:**
- Wait a few minutes between requests
- Upgrade to paid Groq tier for higher limits
- Reduce concurrent agent operations

#### 6. Agent Timeouts

**Solution:**
- Increase `maxIterations` in agent configurations
- Simplify the user prompt
- Break complex requests into smaller tasks

### Debug Mode

Enable detailed logging:

```bash
# Set in .env
LOG_LEVEL=debug

# Run with debug output
npm run dev "Your prompt"
```

### Testing Components

Test individual components:

```typescript
// Test file system tool
import { FileSystemTool } from './src/tools/filesystem.js';

const fsTool = new FileSystemTool();
const result = await fsTool.execute({
  type: 'read',
  path: 'package.json'
});
console.log(result);
```

## Getting Help

If you encounter issues:

1. Check this SETUP.md file
2. Review the main [README.md](README.md)
3. Check agent logs with `LOG_LEVEL=debug`
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your environment (Node version, OS)
   - Relevant logs

## Next Steps

After setup:

1. Try the example commands in README.md
2. Experiment with different prompts
3. Customize agent behaviors in `src/agents/`
4. Add custom tools in `src/tools/`
5. Extend the swarm for your specific use case

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive keys
2. **Rotate API keys regularly**
3. **Use environment-specific configurations**
4. **Limit file system access** - Tools validate paths
5. **Review generated code** - Before deploying to production

## Performance Optimization

1. **Use faster models** for simple tasks:
   ```
   WORKER_MODEL=llama-3.1-8b-instant
   ```

2. **Reduce max iterations** for faster responses:
   ```typescript
   maxIterations: 5  // Default is 10
   ```

3. **Cache frequently used prompts**
4. **Use specific, clear prompts** to reduce agent iterations

---

For additional support, visit the [GitHub repository](https://github.com/mohitkesarwani/My_Agentic_Swarm) or open an issue.
