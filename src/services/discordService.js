import { formatUser, formatChannel } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Discord service utilities for common Discord operations
 */
class DiscordService {
  constructor() {
    this.client = null;
  }

  /**
   * Set the Discord client instance
   * @param {Client} client - Discord.js client instance
   */
  setClient(client) {
    this.client = client;
  }

  /**
   * Check if message is from a configured command channel
   * @param {Message} message - Discord message object
   * @param {string} configuredChannelId - Configured channel ID
   * @returns {boolean} Whether message is from command channel
   */
  isFromCommandChannel(message, configuredChannelId) {
    if (!configuredChannelId) {
      return true; // If no specific channel configured, allow all channels
    }
    return message.channel.id === configuredChannelId;
  }

  /**
   * Check if message is a direct message
   * @param {Message} message - Discord message object
   * @returns {boolean} Whether message is a DM
   */
  isDirectMessage(message) {
    return message.channel.type === 'DM';
  }

  /**
   * Check if message is from a bot
   * @param {Message} message - Discord message object
   * @returns {boolean} Whether message is from a bot
   */
  isFromBot(message) {
    return message.author.bot;
  }

  /**
   * Check if user has required permissions
   * @param {GuildMember} member - Guild member object
   * @param {Array<string>} requiredPermissions - Required permissions
   * @returns {boolean} Whether user has permissions
   */
  hasPermissions(member, requiredPermissions = []) {
    if (!member || !member.permissions) {
      return false;
    }

    return requiredPermissions.every(permission => 
      member.permissions.has(permission)
    );
  }

  /**
   * Send response to message channel or DM
   * @param {Message} message - Original message
   * @param {string} content - Response content
   * @param {object} options - Additional options
   * @returns {Promise<Message>} Sent message
   */
  async sendResponse(message, content, options = {}) {
    try {
      const response = await message.reply({
        content,
        ...options
      });

      logger.debug('Sent response to message:', {
        originalMessage: message.id,
        responseMessage: response.id,
        channel: formatChannel(message.channel)
      });

      return response;
    } catch (error) {
      logger.error('Failed to send response:', error.message);
      throw error;
    }
  }

  /**
   * Send message to specific channel
   * @param {string} channelId - Target channel ID
   * @param {string} content - Message content
   * @param {object} options - Additional options
   * @returns {Promise<Message>} Sent message
   */
  async sendToChannel(channelId, content, options = {}) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      const message = await channel.send({
        content,
        ...options
      });

      logger.debug('Sent message to channel:', {
        channel: formatChannel(channel),
        messageId: message.id
      });

      return message;
    } catch (error) {
      logger.error('Failed to send message to channel:', error.message);
      throw error;
    }
  }

  /**
   * Send direct message to user
   * @param {string} userId - Target user ID
   * @param {string} content - Message content
   * @param {object} options - Additional options
   * @returns {Promise<Message>} Sent message
   */
  async sendDirectMessage(userId, content, options = {}) {
    try {
      const user = await this.client.users.fetch(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const message = await user.send({
        content,
        ...options
      });

      logger.debug('Sent direct message to user:', {
        user: formatUser(user),
        messageId: message.id
      });

      return message;
    } catch (error) {
      logger.error('Failed to send direct message:', error.message);
      throw error;
    }
  }

  /**
   * Get guild information
   * @param {string} guildId - Guild ID
   * @returns {Promise<object>} Guild information
   */
  async getGuildInfo(guildId) {
    try {
      const guild = await this.client.guilds.fetch(guildId);
      if (!guild) {
        throw new Error(`Guild ${guildId} not found`);
      }

      return {
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
        createdAt: guild.createdAt
      };
    } catch (error) {
      logger.error('Failed to get guild info:', error.message);
      throw error;
    }
  }

  /**
   * Get channel information
   * @param {string} channelId - Channel ID
   * @returns {Promise<object>} Channel information
   */
  async getChannelInfo(channelId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        guildId: channel.guildId,
        createdAt: channel.createdAt
      };
    } catch (error) {
      logger.error('Failed to get channel info:', error.message);
      throw error;
    }
  }

  /**
   * Log message details for debugging
   * @param {Message} message - Discord message
   * @param {string} context - Context information
   */
  logMessageDetails(message, context = '') {
    const details = {
      messageId: message.id,
      author: formatUser(message.author),
      channel: formatChannel(message.channel),
      content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
      timestamp: message.createdAt.toISOString(),
      context
    };

    logger.debug('Message details:', details);
  }
}

// Export singleton instance
const discordService = new DiscordService();
export default discordService; 