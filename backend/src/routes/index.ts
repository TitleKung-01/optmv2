import { Router } from "express";
import aiRoutes from "./ai.routes";
import scheduleRoutes from "./schedule.routes";
import tasksRoutes from "./tasks.routes";
import notifyRoutes from "./notify.routes";

const router = Router();

router.use(aiRoutes);
router.use(scheduleRoutes);
router.use(tasksRoutes);
router.use(notifyRoutes);

export default router;
