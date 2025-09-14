import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import logger from './middleware/logger.js';
import apiRoutes from './routes/index.js';

const app = express();

// Middleware
app.use(logger);
app.use(cors());
app.use(express.json());

// Initialize database connection
await connectDatabase();

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (_req, res) => res.send('Chat2Vis Backend API is running!'));

// Start server
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});