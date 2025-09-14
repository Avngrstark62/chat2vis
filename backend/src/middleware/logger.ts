import morgan from 'morgan';
import { config } from '../config/env.js';

// Create custom morgan format
const morganFormat = config.nodeEnv === 'production' 
  ? 'combined' 
  : ':method :url :status :res[content-length] - :response-time ms';

// Create and configure morgan middleware
export const logger = morgan(morganFormat, {
  skip: (req, res) => {
    // Skip logging for health checks in production
    if (config.nodeEnv === 'production' && req.url === '/') {
      return true;
    }
    return false;
  },
  stream: {
    write: (message: string) => {
      // Remove trailing newline and log
      console.log(message.trim());
    }
  }
});

export default logger;
