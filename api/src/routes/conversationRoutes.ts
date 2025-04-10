import { uploadToCloudinary } from './../middleware/cloudinary';
import { createConversationMessage, createEmptyConversation, getSpecificConversation, getUserConversations } from "../controllers/conversationController";

import express from 'express';
import { newMessageCheckup } from '../middleware/multer';

const router = express.Router();

router.get('/', getUserConversations);
router.post('/create', createEmptyConversation);
router.post('/messages/create', newMessageCheckup, uploadToCloudinary, createConversationMessage);
router.get('/:id', getSpecificConversation);

export default router;