import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import './config/database'; // Import database connection

// Import routes
import authRoutes from './routes/auth.routes';
import householdRoutes from './routes/household.routes';
import accountRoutes from './routes/account.routes';
import transactionRoutes from './routes/transaction.routes';
import categoryRoutes from './routes/category.routes';
import recurringTransactionRoutes from './routes/recurringTransaction.routes';
import budgetRoutes from './routes/budget.routes';
import analyticsRoutes from './routes/analyticsRoutes';

// Import jobs
import { startRecurringTransactionCronJob } from './jobs/recurringTransactionJob';
import { adjustSharingRatiosJob } from './jobs/adjustSharingRatioJob';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/households', recurringTransactionRoutes);
app.use('/api/households', budgetRoutes);
app.use('/api/households', analyticsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/accounts', transactionRoutes);
app.use('/api', categoryRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start cron jobs
  logger.info('Starting background jobs...');
  startRecurringTransactionCronJob();
  logger.info('Recurring transaction cron job started');

  // Start sharing ratio adjustment job (daily at specified time)
  adjustSharingRatiosJob();
  logger.info('Sharing ratio adjustment job started');
});

export default app;
