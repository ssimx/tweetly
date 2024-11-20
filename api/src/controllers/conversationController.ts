import { Request, Response } from 'express';
import { UserProps } from '../lib/types';
import { getUserId } from '../services/userService';
import { createConversation, createMessage, getAllConversations, getConversation, getConversationParticipans, getFirstMessage, getFirstUnreadMessage, getMessages, getOldestConversation, updateConversationUpdatedAtTime, updateMessagesReadStatus } from '../services/conversationService';

// ---------------------------------------------------------------------------------------------------------

export const getUserConversations = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const cursor = req.query.cursor;
    
    try {
        if (cursor) {
            const oldestConvo = await getOldestConversation(user.id).then(res => res[0].id);
            if (oldestConvo) {
                if (cursor === oldestConvo) {
                    return res.status(200).json({
                        olderConversations: [],
                        end: true
                    });
                }
            }

            const olderConvos = await getAllConversations(user.id, cursor as string);
            if (!olderConvos) return res.status(404).json({ error: "Couldn't find more posts" });

            const olderConversations = olderConvos.map((convo) => ({
                id: convo.id,
                updatedAt: convo.updatedAt,
                lastMessage: convo.messages[0] || null,
            }));

            const lastOlderConversation = olderConversations.slice(-1);

            return res.status(200).json({
                olderConversations: olderConversations,
                end: oldestConvo
                    ? oldestConvo === lastOlderConversation[0].id ? true : false
                    : true,
            });
        } else {
            const convos = await getAllConversations(user.id);

            // check if user has conversations
            if (convos.length === 0) {
                return res.status(200).json({
                    conversations: [],
                    end: true
                });
            }

            // get last conversation by updatedAt timestamp
            const oldestConvoId = await getOldestConversation(user.id).then(res => res[0].id as string);

            const conversations = convos.map((convo) => ({
                id: convo.id,
                updatedAt: convo.updatedAt,
                lastMessage: convo.messages[0] || null,
            }));

            return res.status(200).json({ 
                conversations: [...conversations],
                end: conversations.filter(convo => convo.id === oldestConvoId).length === 0 ? false : true,
            });
        }
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

            // check if conversation is empty
            if (conversation.messages.length === 0) {
                return res.status(200).json({
                    id: conversation.id,
                    participants: conversation.participants,
                    messages: [],
                    end: true
                });
            }

            // if not, find first message and first unread message from not logged in user (other party)
            const firstMessageId = await getFirstMessage(conversationId).then(res => res?.messages[0].id as string);
            const firstUnreadMessage = await getFirstUnreadMessage(conversationId, user.id) as { id: string, createdAt: Date } | null;

            // if there's a read message, aka conversation is NOT new and is a dialogue
            // update read status of all messages from the other party, by using first read message timestamp
            // if conversation IS new and a monologue, update read status for all messages logged in user RECEIVED
            // firstReadMessage timestamp is optional, if there's a read message use that as a cursor,
            //      if not, then update all messages
            updateMessagesReadStatus(conversationId, user.id, firstUnreadMessage?.createdAt);

            let olderMsgs;
            if (firstUnreadMessage && conversation.messages.filter(msg => msg.id === firstUnreadMessage.id).length === 0) {
                // if unread message is not in the conversation initial cluster, fetch more messages
                olderMsgs = await getMessages(conversationId, firstUnreadMessage.id).then(res => res?.messages);
                console.log('read message: ', olderMsgs);
                
            } else if (conversation.messages.filter(msg => msg.id === firstMessageId).length === 0) {
                // if there's no unread message, fetch all messages by using first message as a cursor
                olderMsgs = await getMessages(conversationId, firstMessageId).then(res => res?.messages);
                console.log('first message: ', olderMsgs);
            }

            const allMsgs = olderMsgs ? [...olderMsgs, ...conversation.messages] : [...conversation.messages];

            return res.status(200).json({
                id: conversation.id,
                participants: conversation.participants,
                messages: allMsgs,
                end: allMsgs.filter(msg => msg.id === firstMessageId).length === 0 ? false : true
            });
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

        // update conversation updateAt time for sorting purposes
        updateConversationUpdatedAtTime(conversationId, newMessage.createdAt);

        return res.status(201).json({ newMessage });
    } catch (error) {
        console.error('Error creating message: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

