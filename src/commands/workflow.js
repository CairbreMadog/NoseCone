import { SlashCommandBuilder } from 'discord.js';
import n8nService from '../services/n8nService.js';
import discordService from '../services/discordService.js';
import logger from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('workflow')
    .setDescription('Trigger n8n workflows or get workflow information')
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('Test the connection to n8n webhooks')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('trigger')
        .setDescription('Manually trigger a workflow message to n8n')
        .addStringOption(option =>
          option.setName('message')
            .setDescription('Message to send to n8n workflow')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Get bot and n8n integration status')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'test':
          await this.handleTest(interaction);
          break;
        case 'trigger':
          await this.handleTrigger(interaction);
          break;
        case 'status':
          await this.handleStatus(interaction);
          break;
        default:
          await interaction.reply({
            content: '❌ Unknown subcommand',
            ephemeral: true
          });
      }
    } catch (error) {
      logger.error('Error in workflow command:', error);
      const errorMessage = 'An error occurred while executing the workflow command.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },

  async handleTest(interaction) {
    await interaction.deferReply({ ephemeral: true });

    logger.info(`Testing n8n webhook connectivity requested by ${interaction.user.username}`);

    try {
      const result = await n8nService.testWebhook();
      
      if (result.success) {
        await interaction.editReply({
          content: '✅ **n8n Webhook Test Successful**\n\n' +
                   'The connection to your n8n webhook is working properly. ' +
                   'Messages will be successfully sent to your n8n workflows.'
        });
        logger.info('n8n webhook test successful via slash command');
      } else {
        await interaction.editReply({
          content: '❌ **n8n Webhook Test Failed**\n\n' +
                   `Error: ${result.error?.message || 'Unknown error'}\n\n` +
                   'Please check your n8n webhook configuration and ensure the webhook URL is accessible.'
        });
        logger.warn('n8n webhook test failed via slash command:', result.error);
      }
    } catch (error) {
      await interaction.editReply({
        content: '❌ **n8n Webhook Test Error**\n\n' +
                 'An unexpected error occurred while testing the webhook connection. ' +
                 'Please check the bot logs for more details.'
      });
      logger.error('Error during n8n webhook test:', error);
    }
  },

  async handleTrigger(interaction) {
    const message = interaction.options.getString('message');
    await interaction.deferReply({ ephemeral: true });

    logger.info(`Manual workflow trigger requested by ${interaction.user.username} with message: "${message}"`);

    try {
      // Create a mock message object for the trigger
      const mockMessage = {
        id: `manual-trigger-${Date.now()}`,
        content: message,
        createdAt: new Date(),
        author: interaction.user,
        member: interaction.member,
        channel: interaction.channel,
        guild: interaction.guild
      };

      const commandData = {
        name: 'workflow',
        subcommand: 'trigger',
        message: message,
        type: 'manual'
      };

      const result = await n8nService.processMessage(mockMessage, 'slash', commandData);

      if (result.primary?.success) {
        let responseMessage = '✅ **Message Sent to n8n Successfully**\n\n' +
                             `Your message has been sent to the n8n workflow.\n\n` +
                             `**Message:** "${message}"`;

        if (result.secondary?.success) {
          responseMessage += '\n\n✅ Also sent to secondary webhook';
        } else if (result.secondary?.error) {
          responseMessage += '\n\n⚠️ Secondary webhook failed';
        }

        await interaction.editReply({ content: responseMessage });
        logger.info('Manual workflow trigger successful');
      } else {
        await interaction.editReply({
          content: '❌ **Failed to Send Message to n8n**\n\n' +
                   `Error: ${result.primary?.error?.message || 'Unknown error'}\n\n` +
                   'Please check your n8n webhook configuration.'
        });
        logger.warn('Manual workflow trigger failed:', result.primary?.error);
      }
    } catch (error) {
      await interaction.editReply({
        content: '❌ **Error Triggering Workflow**\n\n' +
                 'An unexpected error occurred while sending your message to n8n. ' +
                 'Please check the bot logs for more details.'
      });
      logger.error('Error during manual workflow trigger:', error);
    }
  },

  async handleStatus(interaction) {
    await interaction.deferReply({ ephemeral: true });

    logger.info(`Bot status requested by ${interaction.user.username}`);

    try {
      const client = interaction.client;
      const uptime = process.uptime();
      const uptimeString = this.formatUptime(uptime);
      
      // Test n8n connectivity
      const webhookTest = await n8nService.testWebhook();
      const webhookStatus = webhookTest.success ? '✅ Connected' : '❌ Disconnected';

      const statusEmbed = {
        color: webhookTest.success ? 0x00ff00 : 0xff0000,
        title: '🤖 NoseCone Bot Status',
        fields: [
          {
            name: '📊 Bot Information',
            value: `**Status:** ✅ Online\n` +
                   `**Uptime:** ${uptimeString}\n` +
                   `**Guilds:** ${client.guilds.cache.size}\n` +
                   `**Users:** ${client.users.cache.size}`,
            inline: true
          },
          {
            name: '🔗 n8n Integration',
            value: `**Webhook Status:** ${webhookStatus}\n` +
                   `**Primary Endpoint:** Configured\n` +
                   `**Secondary Endpoint:** ${n8nService.config.secondaryWebhook ? 'Configured' : 'Not configured'}`,
            inline: true
          },
          {
            name: '⚙️ Configuration',
            value: `**Command Prefix:** \`${interaction.client.config?.prefix || '!'}\`\n` +
                   `**Debug Mode:** ${process.env.DEBUG_MODE === 'true' ? 'Enabled' : 'Disabled'}\n` +
                   `**Command Channel:** ${process.env.COMMAND_CHANNEL_ID ? 'Configured' : 'All channels'}`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'NoseCone Discord Bot - n8n Integration'
        }
      };

      await interaction.editReply({ embeds: [statusEmbed] });
      logger.info('Bot status provided via slash command');
    } catch (error) {
      await interaction.editReply({
        content: '❌ **Error Getting Status**\n\n' +
                 'An error occurred while retrieving the bot status. ' +
                 'Please check the bot logs for more details.'
      });
      logger.error('Error getting bot status:', error);
    }
  },

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
  }
}; 