import { Request, Response } from 'express';
import { UserProps } from '../lib/types';
import { getUserId } from '../services/userService';
import { createConversation, createMessage, getAllConversations, getConversation, getConversationParticipans, getFirstMessage, getFirstReadMessage, getMessages, updateMessagesReadStatus } from '../services/conversationService';

// ---------------------------------------------------------------------------------------------------------

export const getUserConversations = async (req: Request, res: Response) => {
    const user = req.user as UserProps;

    try {
        const conversations = await getAllConversations(user.id);

        if (!conversations) return res.status(404).json({ error: 'User has no conversations' });

        return res.status(201).json({ conversations });
    } catch (error) {
        console.error('Error getting conversations: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getSpecificConversation = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const conversationId = req.params.id;
    const cursor = req.query.cursor;

    try {
        if (cursor) {
            const firstMessage = await getFirstMessage(conversationId).then(res => res?.messages);
            if (firstMessage) {
                if (cursor === firstMessage[0].id) {
                    return res.status(200).json({
                        messages: [],
                        end: true
                    });
                }
            }

            const messages = await getMessages(conversationId, String(cursor)).then(res => res?.messages);
            if (!messages) return res.status(404).json({ error: "Couldn't find messages" });

            const lastMessage = messages.slice(-1);

            return res.status(200).json({ 
                messages: messages,
                end: firstMessage
                    ? lastMessage[0].id === firstMessage[0].id ? true : false
                    : true,
            });
        } else {
            const conversation = await getConversation(conversationId);
            if (!conversation) return res.status(404).json({ error: "Couldn't find the conversation" });

            const firstReadMessageTimestamp = await getFirstReadMessage(conversationId, user.id).then(res => res?.createdAt);
            console.log(firstReadMessageTimestamp);
            
            if (firstReadMessageTimestamp) updateMessagesReadStatus(conversationId, user.id, firstReadMessageTimestamp);

            return res.status(200).json({ conversation });
        }
    } catch (error) {
        console.error('Error getting conversation / messages: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const createEmptyConversation = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    const { receiver } = req.body as { receiver: string };
    const senderId = id;

    const receiverId = await getUserId(receiver).then(res => res?.id);
    if (!receiverId) return res.status(404).json({ error: 'User does not exist' });

    try {
        const emptyConversationId = await createConversation(senderId, receiverId).then(res => res.id);
        if (!emptyConversationId) return res.status(404).json({ error: "Couldn't create new conversation" });

        return res.status(201).json({ emptyConversationId });
    } catch (error) {
        console.error('Error getting user: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const createConversationMessage = async (req: Request, res: Response) => {
    const { id, username } = req.user as UserProps;
    const { content, conversationId } = req.body as { content: string, conversationId: string};
    const senderId = id;

    const conversationParticipants = await getConversationParticipans(conversationId);
    if (!conversationParticipants) return res.status(404).json({ error: "Conversation not found" });

    const receiver = conversationParticipants.participants.filter((user) => user.userId !== id);

    if (receiver.length === 0) {
        // save logged in user if both participants share same id (logged in user self-conversation)
        receiver.push({ userId: id });
    }

    try {
        const newMessage = await createMessage(senderId, receiver[0].userId, content, conversationId );
        if (!newMessage) return res.status(404).json({ error: "Couldn't create new message" });

        return res.status(201).json({ newMessage });
    } catch (error) {
        console.error('Error creating message: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

