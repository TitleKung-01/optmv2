import { Router } from 'express';
import aiRoutes from './ai.routes';
import scheduleRoutes from './schedule.routes';
import tasksRoutes from './tasks.routes';

const router = Router();

router.use(aiRoutes);
router.use(scheduleRoutes);
router.use(tasksRoutes);

export default router;
