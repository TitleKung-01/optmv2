import { Router } from 'express';
import { lineNotifyHandler, lineWebhookHandler } from '../controllers/notify.controller';

const router = Router();

router.post('/notify/line',    lineNotifyHandler);   // ต้องผ่าน auth middleware
router.post('/notify/webhook', lineWebhookHandler);  // สำหรับ LINE platform เรียกตรง

export default router;
