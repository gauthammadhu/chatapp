import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { setUsername, updateUsername, getProfile, searchUsers } from '../controllers/user.controller';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

router.post('/username', setUsername);
router.put('/username', updateUsername);
router.get('/profile', getProfile);
router.get('/search', searchUsers);

export default router;
