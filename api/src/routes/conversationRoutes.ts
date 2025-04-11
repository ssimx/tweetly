import express from 'express';
import { uploadToCloudinary } from './../middleware/cloudinary.js';
import { createConversationMessage, createEmptyConversation, getSpecificConversation, getUserConversations } from "../controllers/conversationController.js";
import { newMessageCheckup } from '../middleware/multer.js';

const router = express.Router();

router.get('/', getUserConversations);
router.post('/create/:username', createEmptyConversation);
router.post('/messages/create', newMessageCheckup, uploadToCloudinary, createConversationMessage);
router.get('/:id', getSpecificConversation);

export default router;