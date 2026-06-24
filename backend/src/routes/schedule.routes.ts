import { Router } from 'express';
import { generateScheduleHandler } from '../controllers/schedule.controller';

const router = Router();
router.post('/schedule', generateScheduleHandler);

export default router;
