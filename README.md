# My Agentic Swarm 🐝

A powerful multi-agent system built on the IBM Bee Agent Framework that automates software development through specialized AI agents working in an Architect-Worker pattern.

## Overview

My Agentic Swarm is a TypeScript-based orchestration system that uses multiple AI agents to break down, execute, and validate software development tasks. It leverages the Groq LLM (Llama 3.3-70B) through the IBM Bee Agent Framework to coordinate specialized agents for frontend, backend, and QA work.

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

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Groq API key (free tier available at [groq.com](https://groq.com))
- Optional: MongoDB instance for database operations

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

### Usage

Run the swarm with a development prompt:

```bash
npm start "Create a React todo app with MongoDB backend"
```

Or for development with auto-reload:

```bash
npm run dev "Build a REST API for user authentication"
```

## Examples

### Example 1: Create a Landing Page
```bash
npm start "Create a modern landing page with React and Tailwind CSS featuring a hero section, features grid, and contact form"
```

### Example 2: Build an API
```bash
npm start "Build a RESTful API for a blog platform with CRUD operations for posts, comments, and users"
```

### Example 3: Full-Stack Application
```bash
npm start "Create a full-stack task management app with React frontend, Express backend, and MongoDB database"
```

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

### Project Structure
```
My_Agentic_Swarm/
├── src/
│   ├── agents/          # Agent implementations
│   │   ├── architect.ts
│   │   ├── frontend.ts
│   │   ├── backend.ts
│   │   └── qa.ts
│   ├── tools/           # Tool integrations
│   │   ├── mongodb.ts
│   │   ├── render-deploy.ts
│   │   └── filesystem.ts
│   ├── types/           # TypeScript types
│   ├── swarm.ts         # Main orchestrator
│   └── index.ts         # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run dev` - Run with auto-reload for development
- `npm test` - Run tests
- `npm run lint` - Lint the codebase

## Testing

Run the test suite:

```bash
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Troubleshooting

### "GROQ_API_KEY not found"
Make sure you've copied `.env.example` to `.env` and added your Groq API key.

### MongoDB Connection Issues
Ensure your MongoDB instance is running and the `MONGODB_URI` in `.env` is correct.

### Agent Errors
Check the log level in `.env` - set to `debug` for detailed output:
```
LOG_LEVEL=debug
```

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
