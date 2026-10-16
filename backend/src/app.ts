import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.routes.js';
import { resourceRouter } from './routes/resource.routes.js';
import { getMetrics } from './controllers/resource.controller.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders, createRateLimiter } from './middleware/security.js';

export const app = express();

// Attach standard security headers
app.use(securityHeaders);

// Apply rate limiter: 120 requests per minute
app.use(createRateLimiter({ windowMs: 60 * 1000, maxRequests: 120 }));

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5300';

app.use(cors({
  origin: [frontendOrigin, 'http://localhost:5300', 'http://127.0.0.1:5300'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Strict JSON body parsing with max payload bound (100kb)
app.use(express.json({ limit: '100kb' }));

// Mount telemetry endpoint
app.get('/api/metrics', getMetrics);

// Mount resource CRUD routes
app.use('/api/resources', resourceRouter);

// Mount core sample API routes (Health, Message, Greeting)
app.use('/api', apiRouter);

// Catch-all 404 handler for undefined API routes returning structured JSON
app.use((_req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// Centralized error handling middleware
app.use(errorHandler);
