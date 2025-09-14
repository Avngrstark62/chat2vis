import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/chat2vis',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5000',
  nodeEnv: process.env.NODE_ENV || 'development'
};

export default config;
