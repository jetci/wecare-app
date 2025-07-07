import { Router } from 'express';
import { loginHandler, profileHandler, refreshHandler, logoutHandler } from '../controllers/authController';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();
router.post('/login', loginHandler);
router.get('/profile', jwtAuth, profileHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
export default router;
