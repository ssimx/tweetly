import { createConversationMessage, createEmptyConversation, getSpecificConversation, getUserConversations } from "../controllers/conversationController";

const express = require('express');
const router = express.Router();

router.get('/', getUserConversations);
router.post('/check');
router.post('/create', createEmptyConversation);
router.put('/update');
router.delete('/delete');
router.post('/messages/create', createConversationMessage);
router.get('/:id', getSpecificConversation);

export default router;