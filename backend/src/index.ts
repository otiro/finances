import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

// Import routes (à créer)
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import accountRoutes from './routes/account.routes';
// import transactionRoutes from './routes/transaction.routes';
// import categoryRoutes from './routes/category.routes';
// import budgetRoutes from './routes/budget.routes';
// import analyticsRoutes from './routes/analytics.routes';

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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/accounts', accountRoutes);
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/budgets', budgetRoutes);
// app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
