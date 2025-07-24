import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import configService from '../services/configService.js';
import logger from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help information about NoseCone bot commands and features'),

  async execute(interaction) {
    try {
      logger.info(`Help command requested by ${interaction.user.username}`);

      const botConfig = configService.getBotConfig();
      const prefix = botConfig.prefix;

      const helpEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('🚀 NoseCone Bot - Help & Information')
        .setDescription('NoseCone is a Discord bot that integrates with n8n workflow automation platform. It allows you to send Discord messages and interactions directly to your n8n workflows.')
        .addFields(
          {
            name: '📝 **Slash Commands**',
            value: 
              '`/workflow test` - Test n8n webhook connectivity\n' +
              '`/workflow trigger <message>` - Manually send a message to n8n\n' +
              '`/workflow status` - Get bot and integration status\n' +
              '`/help` - Show this help information',
            inline: false
          },
          {
            name: '💬 **Message Processing**',
            value: 
              `• Messages starting with \`${prefix}\` are treated as commands\n` +
              '• Direct messages to the bot are automatically processed\n' +
              '• Channel messages (in configured channels) are sent to n8n\n' +
              '• All message data includes user info, timestamps, and context',
            inline: false
          },
          {
            name: '🔗 **n8n Integration**',
            value: 
              '• Messages are sent as JSON payloads to configured webhooks\n' +
              '• Primary webhook receives all processed messages\n' +
              '• Secondary webhook receives command data (if configured)\n' +
              '• Webhook authentication supported via tokens',
            inline: false
          },
          {
            name: '📋 **Message Data Structure**',
            value: 
              '```json\n' +
              '{\n' +
              '  "messageType": "channel|slash|dm",\n' +
              '  "message": {\n' +
              '    "id": "message_id",\n' +
              '    "content": "text content",\n' +
              '    "author": { "id", "username", "roles" },\n' +
              '    "channel": { "id", "name", "type" },\n' +
              '    "guild": { "id", "name" }\n' +
              '  },\n' +
              '  "command": { "name", "options" }\n' +
              '}\n' +
              '```',
            inline: false
          },
          {
            name: '🛠️ **Setup Requirements**',
            value: 
              '• Discord Bot Token (from Discord Developer Portal)\n' +
              '• n8n Webhook URL (from your n8n instance)\n' +
              '• Proper bot permissions in Discord server\n' +
              '• Environment variables configured',
            inline: false
          },
          {
            name: '🔧 **Configuration**',
            value: 
              `**Command Prefix:** \`${prefix}\`\n` +
              `**Debug Mode:** ${configService.isDebugMode() ? 'Enabled' : 'Disabled'}\n` +
              `**Command Channel:** ${botConfig.commandChannelId ? 'Configured' : 'All channels'}\n` +
              `**Version:** 1.0.0`,
            inline: false
          }
        )
        .setFooter({
          text: 'NoseCone Discord Bot - Bridging Discord and n8n workflows',
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
      logger.info('Help information provided via slash command');

    } catch (error) {
      logger.error('Error in help command:', error);
      
      const errorMessage = 'An error occurred while retrieving help information.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
}; 