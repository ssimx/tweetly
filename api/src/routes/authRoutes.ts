import { loginUser, registerTempUser, registerUser, settingsAccess, updateTempUserProfilePicture, updateTempUserUsername } from "../controllers/authController.js";
import { authenticateSessionJWT } from "../middleware/authenticateSessionJWT.js";
import { uploadToCloudinary } from '../middleware/cloudinary.js';
import { registerUserCheckup } from '../middleware/multer.js';
import express from 'express';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerTempUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.patch('/temporary/username', authenticateSessionJWT, updateTempUserUsername);
router.patch('/temporary/profilePicture', authenticateSessionJWT, registerUserCheckup, uploadToCloudinary, updateTempUserProfilePicture, registerUser);
router.post('/settings', authenticateSessionJWT, settingsAccess);

export default router;