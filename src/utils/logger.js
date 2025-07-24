import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, '../../logs');
try {
  mkdirSync(logsDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

class Logger {
  constructor() {
    this.debugMode = process.env.DEBUG_MODE === 'true';
    this.logFile = createWriteStream(join(logsDir, 'app.log'), { flags: 'a' });
  }

  _formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${formattedArgs}`;
  }

  _log(level, message, ...args) {
    const formattedMessage = this._formatMessage(level, message, ...args);
    
    // Write to file
    this.logFile.write(formattedMessage + '\n');
    
    // Write to console
    console.log(formattedMessage);
  }

  info(message, ...args) {
    this._log('info', message, ...args);
  }

  warn(message, ...args) {
    this._log('warn', message, ...args);
  }

  error(message, ...args) {
    this._log('error', message, ...args);
  }

  debug(message, ...args) {
    if (this.debugMode) {
      this._log('debug', message, ...args);
    }
  }

  close() {
    this.logFile.end();
  }
}

const logger = new Logger();

export default logger; 