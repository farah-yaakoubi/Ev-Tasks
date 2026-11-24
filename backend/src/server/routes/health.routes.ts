import { Router } from 'express';
import { checkDatabase } from '../services/health.service.js';

export const healthRoutes = Router();

healthRoutes.get('/healthz', (_request, response) => {
  response.json({ status: 'ok' });
});

healthRoutes.get('/api/health', async (_request, response) => {
  try {
    await checkDatabase();
    response.json({ status: 'ok', database: 'connected' });
  } catch {
    response.status(503).json({ status: 'error', database: 'unavailable' });
  }
});
