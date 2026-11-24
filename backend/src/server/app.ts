import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { prepareMediaStorage } from './storage/media-storage.js';

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
const mediaStorage = prepareMediaStorage();
app.use('/uploads', express.static(mediaStorage));
app.use(authRoutes);
app.use(healthRoutes);
app.use((_request, response) => response.status(404).json({ error: 'Route introuvable.' }));
