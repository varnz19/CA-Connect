import { Router } from 'express';
import { MessageController } from '../controllers/remaining.controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new MessageController();

router.use(authenticate);
router.get('/conversations', controller.getConversations);
router.get('/conversations/client/:clientId?', controller.getOrCreateConversation);
router.post('/conversations/init', controller.getOrCreateConversation);
router.get('/conversations/:conversationId', controller.getMessages);
router.post('/send', controller.sendMessage);
router.put('/:messageId/read', controller.markAsRead);

export default router;
