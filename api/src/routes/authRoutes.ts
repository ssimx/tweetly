import { loginUser, registerTempUser, registerUser, settingsAccess, updateTempUserProfilePicture, updateTempUserUsername } from "../controllers/authController";
import { authenticateSessionJWT } from "../middleware/authenticateSessionJWT";
import { uploadToCloudinary } from '../middleware/cloudinary';
import { uploadSingleImageCheckup } from '../middleware/multer';
import express from 'express';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerTempUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.patch('/temporary/username', authenticateSessionJWT, updateTempUserUsername);
router.patch('/temporary/profilePicture', authenticateSessionJWT, uploadSingleImageCheckup, uploadToCloudinary, updateTempUserProfilePicture, registerUser);
router.post('/settings', authenticateSessionJWT, settingsAccess);

export default router;