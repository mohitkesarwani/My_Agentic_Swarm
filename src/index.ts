/**
 * My Agentic Swarm - Entry Point
 * A multi-agent system built on IBM Bee Agent Framework
 */

import dotenv from 'dotenv';
import { AgenticSwarm } from './swarm.js';
import { SwarmConfig, DeploymentConfig } from './types/index.js';

// Load environment variables
dotenv.config();

/**
 * Main function
 */
async function main() {
  console.log('🐝 My Agentic Swarm - Multi-Agent Development System\n');

  // Validate environment variables
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.error('Error: GROQ_API_KEY environment variable is required');
    console.error('Please copy .env.example to .env and add your Groq API key');
    process.exit(1);
  }

  // Get user prompt from command line arguments
  const userPrompt = process.argv.slice(2).join(' ');
  if (!userPrompt) {
    console.log('Usage: npm start <your development request>');
    console.log('\nExample:');
    console.log('  npm start "Create a React todo app with MongoDB backend"');
    console.log('  npm start "Build a REST API for user management"\n');
    process.exit(0);
  }

  // Configure the swarm
  const config: SwarmConfig = {
    maxRetries: 2,
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    groqApiKey,
    modelName: process.env.ARCHITECT_MODEL || 'llama-3.3-70b-versatile',
  };

  // Optional MongoDB configuration
  const mongoUri = process.env.MONGODB_URI;

  // Optional deployment configuration
  let deployConfig: DeploymentConfig | undefined;
  if (process.env.RENDER_DEPLOY_HOOK) {
    deployConfig = {
      webhookUrl: process.env.RENDER_DEPLOY_HOOK,
      environment: 'production',
    };
  }

  try {
    // Initialize the swarm
    console.log('Initializing agents...');
    const swarm = new AgenticSwarm(config, process.cwd(), mongoUri, deployConfig);

    // Execute the user prompt
    console.log(`\n📝 Processing request: "${userPrompt}"\n`);
    const result = await swarm.executePrompt(userPrompt);

    // Display results
    console.log('\n✅ Workflow completed successfully!');
    console.log(`\nStarted: ${result.startTime.toISOString()}`);
    console.log(`Completed: ${result.endTime?.toISOString()}`);
    console.log(`\nTasks executed: ${result.tasks.length}`);

    // Display task summary
    console.log('\n📊 Task Summary:');
    for (const task of result.tasks) {
      const statusEmoji = task.status === 'completed' ? '✅' : task.status === 'failed' ? '❌' : '⏳';
      console.log(`  ${statusEmoji} [${task.assignedTo}] ${task.description}`);
      if (task.error) {
        console.log(`     Error: ${task.error}`);
      }
    }

    console.log('\n🎉 Development workflow completed!\n');
  } catch (error) {
    console.error('\n❌ Workflow failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
