import { validateBotToken, validateUrl, validateSnowflake } from '../utils/validators.js';
import logger from '../utils/logger.js';

/**
 * Configuration service for managing environment variables and settings
 */
class ConfigService {
  constructor() {
    this.config = this._loadConfig();
    this._validateConfig();
  }

  /**
   * Load configuration from environment variables
   * @private
   * @returns {object} Configuration object
   */
  _loadConfig() {
    return {
      discord: {
        botToken: process.env.DISCORD_BOT_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID,
        // clientSecret: process.env.DISCORD_CLIENT_SECRET, // No longer available in Discord Developer Portal
      },
      n8n: {
        webhookUrl: process.env.N8N_WEBHOOK_URL,
        webhookToken: process.env.N8N_WEBHOOK_TOKEN,
        secondaryWebhook: process.env.N8N_SECONDARY_WEBHOOK,
      },
      bot: {
        prefix: process.env.BOT_PREFIX || '!',
        commandChannelId: process.env.COMMAND_CHANNEL_ID,
        debugMode: process.env.DEBUG_MODE === 'true',
      }
    };
  }

  /**
   * Validate configuration values
   * @private
   * @throws {Error} If configuration is invalid
   */
  _validateConfig() {
    const errors = [];

    // Validate Discord configuration
    if (!this.config.discord.botToken) {
      errors.push('DISCORD_BOT_TOKEN is required');
    } else if (!validateBotToken(this.config.discord.botToken)) {
      errors.push('DISCORD_BOT_TOKEN has invalid format');
    }

    if (!this.config.discord.clientId) {
      errors.push('DISCORD_CLIENT_ID is required');
    } else if (!validateSnowflake(this.config.discord.clientId)) {
      errors.push('DISCORD_CLIENT_ID has invalid format');
    }

    // Validate n8n configuration
    if (!this.config.n8n.webhookUrl) {
      errors.push('N8N_WEBHOOK_URL is required');
    } else if (!validateUrl(this.config.n8n.webhookUrl)) {
      errors.push('N8N_WEBHOOK_URL has invalid URL format');
    }

    if (this.config.n8n.secondaryWebhook && !validateUrl(this.config.n8n.secondaryWebhook)) {
      errors.push('N8N_SECONDARY_WEBHOOK has invalid URL format');
    }

    // Validate bot configuration
    if (this.config.bot.commandChannelId && !validateSnowflake(this.config.bot.commandChannelId)) {
      errors.push('COMMAND_CHANNEL_ID has invalid format');
    }

    if (errors.length > 0) {
      logger.error('Configuration validation failed:', errors);
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    logger.info('Configuration validation passed');
  }

  /**
   * Get Discord configuration
   * @returns {object} Discord configuration
   */
  getDiscordConfig() {
    return { ...this.config.discord };
  }

  /**
   * Get n8n configuration
   * @returns {object} n8n configuration
   */
  getN8nConfig() {
    return { ...this.config.n8n };
  }

  /**
   * Get bot configuration
   * @returns {object} Bot configuration
   */
  getBotConfig() {
    return { ...this.config.bot };
  }

  /**
   * Get specific configuration value
   * @param {string} path - Dot notation path to config value
   * @returns {any} Configuration value
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  /**
   * Check if debug mode is enabled
   * @returns {boolean} Debug mode status
   */
  isDebugMode() {
    return this.config.bot.debugMode;
  }
}

// Export singleton instance
const configService = new ConfigService();
export default configService; 