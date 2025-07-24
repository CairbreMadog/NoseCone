import { Events } from 'discord.js';
import logger from '../utils/logger.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`NoseCone bot is ready! Logged in as ${client.user.tag}`);
    logger.info(`Connected to ${client.guilds.cache.size} guilds`);
    
    // Log guild information
    client.guilds.cache.forEach(guild => {
      logger.debug(`Connected to guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
    });

    // Set bot activity status
    client.user.setActivity('n8n workflows', { type: 'WATCHING' });
    
    logger.info('Bot initialization complete and ready to process messages');
  },
}; 