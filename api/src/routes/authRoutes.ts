import { loginUser, registerTempUser, registerUser, settingsAccess, updateTempUserPassword, updateTempUserProfilePicture, updateTempUserUsername } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { uploadToCloudinary } from '../middleware/cloudinary';
import { uploadSingleImageCheckup } from '../middleware/multer';
import express from 'express';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerTempUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.patch('/temporary/password', authenticateJWT, updateTempUserPassword);
router.patch('/temporary/username', authenticateJWT, updateTempUserUsername);
router.patch('/temporary/profilePicture', authenticateJWT, uploadSingleImageCheckup, uploadToCloudinary, updateTempUserProfilePicture, registerUser);
router.post('/settings', authenticateJWT, settingsAccess);

export default router;