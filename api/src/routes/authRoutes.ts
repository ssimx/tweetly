import { loginUser, registerUser, settingsAccess } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authenticateJWT";

import express from 'express';
const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.post('/settings', authenticateJWT, settingsAccess);

export default router;