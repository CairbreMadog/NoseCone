/**
 * General helper functions used across the application
 */

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats user data for logging/display
 * @param {object} user - Discord user object
 * @returns {string} - Formatted user string
 */
export function formatUser(user) {
  return `${user.username}#${user.discriminator} (${user.id})`;
}

/**
 * Formats channel data for logging/display
 * @param {object} channel - Discord channel object
 * @returns {string} - Formatted channel string
 */
export function formatChannel(channel) {
  return `#${channel.name} (${channel.id})`;
}

/**
 * Truncates text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Extracts command and arguments from message content
 * @param {string} content - Message content
 * @param {string} prefix - Command prefix
 * @returns {object} - Parsed command data
 */
export function parseCommand(content, prefix = '!') {
  if (!content.startsWith(prefix)) {
    return null;
  }
  
  const args = content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();
  
  return { command, args };
}

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @returns {object} - Error response object
 */
export function createErrorResponse(message, type = 'error') {
  return {
    success: false,
    error: {
      type,
      message,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Creates a standardized success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {object} - Success response object
 */
export function createSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        break;
      }
      
      const delayMs = baseDelay * Math.pow(2, i);
      await delay(delayMs);
    }
  }
  
  throw lastError;
} 