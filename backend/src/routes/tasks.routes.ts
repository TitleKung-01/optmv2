import { Router } from 'express';
import {
  getTasksHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  spawnRecurringHandler,
} from '../controllers/tasks.controller';

const router = Router();

// NOTE: spawn-recurring must be before /:id to avoid route conflict
router.post('/tasks/spawn-recurring', spawnRecurringHandler);
router.get('/tasks', getTasksHandler);
router.post('/tasks', createTaskHandler);
router.put('/tasks/:id', updateTaskHandler);
router.delete('/tasks/:id', deleteTaskHandler);

export default router;
