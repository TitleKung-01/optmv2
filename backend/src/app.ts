import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { requireAuth } from './middleware/auth';
import apiRoutes from './routes';

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use('/api', requireAuth as express.RequestHandler);
app.use('/api', apiRoutes);

export default app;
