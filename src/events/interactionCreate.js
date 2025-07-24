import { Events } from 'discord.js';
import discordService from '../services/discordService.js';
import n8nService from '../services/n8nService.js';
import configService from '../services/configService.js';
import logger from '../utils/logger.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      logger.info(`Executing slash command: ${interaction.commandName} by ${interaction.user.username}`);
      
      // Create a message-like object for n8n processing
      const messageData = {
        id: interaction.id,
        content: `/${interaction.commandName} ${interaction.options.data.map(opt => `${opt.name}:${opt.value}`).join(' ')}`,
        createdAt: new Date(),
        author: interaction.user,
        member: interaction.member,
        channel: interaction.channel,
        guild: interaction.guild
      };

      // Create command data
      const commandData = {
        name: interaction.commandName,
        options: interaction.options.data.reduce((acc, option) => {
          acc[option.name] = option.value;
          return acc;
        }, {}),
        type: 'slash'
      };

      // Process the interaction and send to n8n
      const result = await n8nService.processMessage(messageData, 'slash', commandData);

      // Execute the command
      await command.execute(interaction);

      // Log n8n processing result
      if (result.primary?.success) {
        logger.info('Slash command data successfully sent to n8n webhook');
      } else {
        logger.warn('Failed to send slash command data to primary n8n webhook:', result.primary?.error);
      }

      if (result.secondary) {
        if (result.secondary.success) {
          logger.info('Slash command data successfully sent to secondary n8n webhook');
        } else {
          logger.warn('Failed to send slash command data to secondary n8n webhook:', result.secondary.error);
        }
      }

    } catch (error) {
      logger.error('Error executing slash command:', error);
      
      // Send error response to user
      const errorMessage = 'There was an error while executing this command!';
      
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        logger.error('Failed to send error response for slash command:', replyError.message);
      }
    }
  },
}; 