import cors from 'cors';
import { env } from '../config/env';

const allowedOrigins = env.CORS_ORIGINS
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
