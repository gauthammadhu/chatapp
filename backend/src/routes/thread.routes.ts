import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { createThread, getThreads } from '../controllers/thread.controller';

const router = express.Router();

// All thread routes require authentication
router.use(authMiddleware);

router.post('/', createThread);
router.get('/', getThreads);

export default router;
