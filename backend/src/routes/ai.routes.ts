import { Router } from 'express';
import { aiBreakdownHandler } from '../controllers/ai.controller';

const router = Router();
router.post('/ai-breakdown', aiBreakdownHandler);

export default router;
