import { loginUser, registerTempUser, settingsAccess, updateTempUserPassword, updateTempUserUsername } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authenticateJWT";

import express from 'express';
const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerTempUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.patch('/temporary/password', authenticateJWT, updateTempUserPassword);
router.patch('/temporary/username', authenticateJWT, updateTempUserUsername);
router.post('/settings', authenticateJWT, settingsAccess);

export default router;