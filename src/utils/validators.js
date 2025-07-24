/**
 * Validation utilities for user inputs and data
 */

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates Discord bot token format
 * @param {string} token - The bot token to validate
 * @returns {boolean} - Whether the token is valid
 */
export function validateBotToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Discord bot tokens have specific format
  const tokenRegex = /^[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}$/;
  return tokenRegex.test(token);
}

/**
 * Validates URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates Discord snowflake ID
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export function validateSnowflake(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  const snowflakeRegex = /^\d{17,19}$/;
  return snowflakeRegex.test(id);
}

/**
 * Sanitizes user input to prevent injection attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[`]/g, '') // Remove backticks that could break code blocks
    .trim()
    .slice(0, 2000); // Discord message limit
}

/**
 * Validates webhook payload structure
 * @param {object} payload - The payload to validate
 * @returns {boolean} - Whether the payload is valid
 */
export function validateWebhookPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  
  const requiredFields = ['messageType', 'message'];
  return requiredFields.every(field => field in payload);
} 