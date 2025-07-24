import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import configService from './services/configService.js';
import discordService from './services/discordService.js';
import n8nService from './services/n8nService.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main bot class for NoseCone Discord Bot
 */
class NoseConeBot {
  constructor() {
    this.client = null;
    this.commands = new Collection();
    this.config = configService.getBotConfig();
    this.discordConfig = configService.getDiscordConfig();
  }

  /**
   * Initialize and start the Discord bot
   */
  async start() {
    try {
      await this.createClient();
      await this.loadCommands();
      await this.loadEvents();
      await this.login();
      await this.testN8nConnectivity();
    } catch (error) {
      logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  /**
   * Create Discord client with required intents
   * @private
   */
  async createClient() {
    logger.info('Creating Discord client...');
    
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
      ]
    });

    // Set up the client in discord service
    discordService.setClient(this.client);

    // Add commands collection to client
    this.client.commands = this.commands;
    
    logger.info('Discord client created successfully');
  }

  /**
   * Load command modules
   * @private
   */
  async loadCommands() {
    logger.info('Loading command modules...');
    
    try {
      const commandsPath = join(__dirname, 'commands');
      const commandFiles = (await readdir(commandsPath)).filter(file => 
        file.endsWith('.js') && !file.startsWith('index')
      );

      for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await import(filePath);
        
        if ('data' in command.default && 'execute' in command.default) {
          this.commands.set(command.default.data.name, command.default);
          logger.debug(`Loaded command: ${command.default.data.name}`);
        } else {
          logger.warn(`Command file ${file} is missing required 'data' or 'execute' property`);
        }
      }

      logger.info(`Loaded ${this.commands.size} commands`);
    } catch (error) {
      logger.error('Error loading commands:', error);
      throw error;
    }
  }

  /**
   * Load event handlers
   * @private
   */
  async loadEvents() {
    logger.info('Loading event handlers...');
    
    try {
      const eventsPath = join(__dirname, 'events');
      const eventFiles = (await readdir(eventsPath)).filter(file => file.endsWith('.js'));

      for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event = await import(filePath);
        
        if (event.default.once) {
          this.client.once(event.default.name, (...args) => event.default.execute(...args));
        } else {
          this.client.on(event.default.name, (...args) => event.default.execute(...args));
        }
        
        logger.debug(`Loaded event: ${event.default.name}`);
      }

      logger.info('Event handlers loaded successfully');
    } catch (error) {
      logger.error('Error loading events:', error);
      throw error;
    }
  }

  /**
   * Login to Discord
   * @private
   */
  async login() {
    logger.info('Logging in to Discord...');
    
    try {
      await this.client.login(this.discordConfig.botToken);
      logger.info('Successfully logged in to Discord');
    } catch (error) {
      logger.error('Failed to login to Discord:', error);
      throw error;
    }
  }

  /**
   * Test n8n webhook connectivity
   * @private
   */
  async testN8nConnectivity() {
    logger.info('Testing n8n webhook connectivity...');
    
    try {
      const result = await n8nService.testWebhook();
      if (result.success) {
        logger.info('n8n webhook connectivity test passed');
      } else {
        logger.warn('n8n webhook connectivity test failed:', result.error);
      }
    } catch (error) {
      logger.warn('Could not test n8n connectivity:', error.message);
    }
  }

  /**
   * Gracefully shutdown the bot
   */
  async shutdown() {
    logger.info('Shutting down bot...');
    
    if (this.client) {
      this.client.destroy();
    }
    
    logger.close();
    logger.info('Bot shutdown complete');
  }
}

/**
 * Start the bot
 * @returns {Promise<void>}
 */
export async function startBot() {
  const bot = new NoseConeBot();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await bot.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await bot.shutdown();
    process.exit(0);
  });
  
  await bot.start();
  return bot;
} 