import axios from 'axios';
import { validateWebhookPayload } from '../utils/validators.js';
import { retryWithBackoff, createErrorResponse, createSuccessResponse } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import configService from './configService.js';

/**
 * Service for integrating with n8n workflows via webhooks
 */
class N8nService {
  constructor() {
    this.config = configService.getN8nConfig();
    this.setupAxiosDefaults();
  }

  /**
   * Setup axios default configuration
   * @private
   */
  setupAxiosDefaults() {
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NoseCone-Discord-Bot/1.0.0'
      }
    });

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use((config) => {
      if (this.config.webhookToken) {
        config.headers['Authorization'] = `Bearer ${this.config.webhookToken}`;
      }
      return config;
    });

    // Add response interceptor for logging
    this.httpClient.interceptors.response.use(
      (response) => {
        logger.debug('n8n webhook response received:', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('n8n webhook error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create webhook payload from Discord message
   * @param {object} message - Discord message object
   * @param {string} messageType - Type of message (channel, slash, dm)
   * @param {object} command - Command data (optional)
   * @returns {object} Webhook payload
   */
  createWebhookPayload(message, messageType, command = null) {
    const payload = {
      messageType,
      message: {
        id: message.id,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        author: {
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          roles: message.member?.roles?.cache?.map(role => role.id) || []
        },
        channel: {
          id: message.channel.id,
          name: message.channel.name || 'DM',
          type: message.channel.type
        }
      }
    };

    // Add guild information if available
    if (message.guild) {
      payload.message.guild = {
        id: message.guild.id,
        name: message.guild.name
      };
    }

    // Add command information if provided
    if (command) {
      payload.command = command;
    }

    return payload;
  }

  /**
   * Send data to primary n8n webhook
   * @param {object} payload - Data to send
   * @returns {Promise<object>} Response from webhook
   */
  async sendToWebhook(payload) {
    if (!validateWebhookPayload(payload)) {
      throw new Error('Invalid webhook payload structure');
    }

    logger.debug('Sending payload to n8n webhook:', payload);

    try {
      const response = await retryWithBackoff(async () => {
        return await this.httpClient.post(this.config.webhookUrl, payload);
      });

      logger.info('Successfully sent data to n8n webhook', {
        messageId: payload.message?.id,
        webhookUrl: this.config.webhookUrl
      });

      return createSuccessResponse(response.data, 'Data sent to n8n webhook');
    } catch (error) {
      logger.error('Failed to send data to n8n webhook:', error.message);
      return createErrorResponse(`Failed to send data to n8n: ${error.message}`, 'webhook_error');
    }
  }

  /**
   * Send data to secondary n8n webhook
   * @param {object} payload - Data to send
   * @returns {Promise<object>} Response from webhook
   */
  async sendToSecondaryWebhook(payload) {
    if (!this.config.secondaryWebhook) {
      return createErrorResponse('Secondary webhook URL not configured', 'config_error');
    }

    if (!validateWebhookPayload(payload)) {
      throw new Error('Invalid webhook payload structure');
    }

    logger.debug('Sending payload to secondary n8n webhook:', payload);

    try {
      const response = await retryWithBackoff(async () => {
        return await this.httpClient.post(this.config.secondaryWebhook, payload);
      });

      logger.info('Successfully sent data to secondary n8n webhook', {
        messageId: payload.message?.id,
        webhookUrl: this.config.secondaryWebhook
      });

      return createSuccessResponse(response.data, 'Data sent to secondary n8n webhook');
    } catch (error) {
      logger.error('Failed to send data to secondary n8n webhook:', error.message);
      return createErrorResponse(`Failed to send data to secondary n8n: ${error.message}`, 'webhook_error');
    }
  }

  /**
   * Process Discord message and send to appropriate webhook
   * @param {object} message - Discord message object
   * @param {string} messageType - Type of message
   * @param {object} command - Command data (optional)
   * @returns {Promise<object>} Processing result
   */
  async processMessage(message, messageType, command = null) {
    try {
      const payload = this.createWebhookPayload(message, messageType, command);
      
      // Send to primary webhook
      const primaryResult = await this.sendToWebhook(payload);
      
      // If command data exists, also send to secondary webhook
      if (command && this.config.secondaryWebhook) {
        const secondaryResult = await this.sendToSecondaryWebhook(payload);
        return {
          primary: primaryResult,
          secondary: secondaryResult
        };
      }

      return { primary: primaryResult };
    } catch (error) {
      logger.error('Error processing message for n8n:', error.message);
      return createErrorResponse(`Message processing failed: ${error.message}`, 'processing_error');
    }
  }

  /**
   * Test webhook connectivity
   * @returns {Promise<object>} Test result
   */
  async testWebhook() {
    const testPayload = {
      messageType: 'test',
      message: {
        id: 'test-message-id',
        content: 'NoseCone webhook connectivity test',
        timestamp: new Date().toISOString(),
        author: {
          id: 'test-user-id',
          username: 'NoseCone',
          discriminator: '0000',
          roles: []
        },
        channel: {
          id: 'test-channel-id',
          name: 'test-channel',
          type: 'GUILD_TEXT'
        }
      }
    };

    logger.info('Testing n8n webhook connectivity...');
    return await this.sendToWebhook(testPayload);
  }
}

// Export singleton instance
const n8nService = new N8nService();
export default n8nService; 