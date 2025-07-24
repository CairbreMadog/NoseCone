import 'dotenv/config';
import { startBot } from './src/bot.js';
import logger from './src/utils/logger.js';

async function main() {
  try {
    logger.info('Starting NoseCone Discord Bot...');
    await startBot();
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

main(); 