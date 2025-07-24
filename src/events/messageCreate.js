import { Events } from 'discord.js';
import discordService from '../services/discordService.js';
import n8nService from '../services/n8nService.js';
import configService from '../services/configService.js';
import { parseCommand } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export default {
  name: Events.MessageCreate,
  async execute(message) {
    // Skip if message is from a bot
    if (discordService.isFromBot(message)) {
      return;
    }

    const botConfig = configService.getBotConfig();
    
    try {
      // Determine message type
      let messageType = 'channel';
      let shouldProcess = false;

      if (discordService.isDirectMessage(message)) {
        messageType = 'dm';
        shouldProcess = true;
        logger.debug('Processing direct message');
      } else if (discordService.isFromCommandChannel(message, botConfig.commandChannelId)) {
        messageType = 'channel';
        shouldProcess = true;
        logger.debug('Processing channel message from configured channel');
      } else {
        // Message from non-configured channel, skip processing
        return;
      }

      if (!shouldProcess) {
        return;
      }

      // Log message details for debugging
      discordService.logMessageDetails(message, `Processing ${messageType} message`);

      // Check if message is a command
      let commandData = null;
      if (message.content.startsWith(botConfig.prefix)) {
        const parsedCommand = parseCommand(message.content, botConfig.prefix);
        if (parsedCommand) {
          commandData = {
            name: parsedCommand.command,
            args: parsedCommand.args,
            prefix: botConfig.prefix
          };
          logger.debug('Parsed command from message:', commandData);
        }
      }

      // Process message and send to n8n
      logger.info(`Processing ${messageType} message from ${message.author.username}`);
      const result = await n8nService.processMessage(message, messageType, commandData);

      // Log processing result
      if (result.primary?.success) {
        logger.info('Message successfully sent to n8n webhook');
      } else {
        logger.warn('Failed to send message to primary n8n webhook:', result.primary?.error);
      }

      if (result.secondary) {
        if (result.secondary.success) {
          logger.info('Message successfully sent to secondary n8n webhook');
        } else {
          logger.warn('Failed to send message to secondary n8n webhook:', result.secondary.error);
        }
      }

      // Send confirmation response if in debug mode
      if (configService.isDebugMode() && !discordService.isDirectMessage(message)) {
        const status = result.primary?.success ? '✅' : '❌';
        const responseMessage = `${status} Message ${result.primary?.success ? 'sent to' : 'failed to send to'} n8n webhook`;
        
        try {
          await discordService.sendResponse(message, responseMessage);
        } catch (error) {
          logger.error('Failed to send confirmation response:', error.message);
        }
      }

    } catch (error) {
      logger.error('Error processing message:', error);
      
      // Send error response if in debug mode
      if (configService.isDebugMode() && !discordService.isDirectMessage(message)) {
        try {
          await discordService.sendResponse(message, '❌ Error processing message for n8n');
        } catch (responseError) {
          logger.error('Failed to send error response:', responseError.message);
        }
      }
    }
  },
}; 