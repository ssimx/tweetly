import { NextFunction, Request, Response } from 'express';
import { UserProps } from '../lib/types';
import { getUserId } from '../services/userService';
import { createConversation, createMessage, getAllConversations, getConversation, getConversationParticipans, getFirstMessage, getFirstUnreadMessage, getMessages, getOldestConversation, updateConversationUpdatedAtTime, updateMessagesReadStatus } from '../services/conversationService';
import { AppError, ConversationCardType, ConversationMessageType, SuccessResponse, ConversationType, LoggedInUserDataType } from 'tweetly-shared';

// ---------------------------------------------------------------------------------------------------------

export const getUserConversations = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const cursor = req.query.cursor;

    try {
        if (cursor) {
            const oldestConversationId = await getOldestConversation(user.id).then(res => res?.id);
            if (oldestConversationId) {
                if (cursor === oldestConversationId) {
                    const successResponse: SuccessResponse<{ conversations: ConversationCardType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            conversations: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    res.status(200).json(successResponse);
                }
            }

            const conversationsData = await getAllConversations(user.id, cursor as string);
            const conversations = conversationsData.map((conversation) => ({
                id: conversation.id,
                updatedAt: conversation.updatedAt,
                lastMessage: conversation.messages.length ? {
                    id: conversation.messages[0].id,
                    content: conversation.messages[0].content,
                    readStatus: conversation.messages[0].readStatus,
                    sender: {
                        username: conversation.messages[0].sender.username,
                        profile: {
                            name: conversation.messages[0].sender.profile!.name,
                            profilePicture: conversation.messages[0].sender.profile!.profilePicture,
                        }
                    },
                    receiver: {
                        username: conversation.messages[0].receiver.username,
                        profile: {
                            name: conversation.messages[0].receiver.profile!.name,
                            profilePicture: conversation.messages[0].receiver.profile!.profilePicture,
                        }
                    },
                } : null,
            })) as ConversationCardType[];

            const conversationsEnd = conversations.length === 0
                ? true
                : oldestConversationId === conversations.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ conversations: ConversationCardType[], cursor: string | null, end: boolean }> = {
                success: true,
                data: {
                    conversations: conversations ?? [],
                    cursor: conversations.slice(-1)[0]?.id ?? null,
                    end: conversationsEnd
                },
            };

            res.status(200).json(successResponse);
        } else {
            const oldestConversationId = await getOldestConversation(user.id).then(res => res?.id);
            const conversationsData = await getAllConversations(user.id, cursor as string);

            const conversations = conversationsData.map((conversation) => ({
                id: conversation.id,
                updatedAt: conversation.updatedAt,
                lastMessage: conversation.messages.length ? {
                    id: conversation.messages[0].id,
                    content: conversation.messages[0].content,
                    images: conversation.messages[0].images,
                    readStatus: conversation.messages[0].readStatus,
                    sender: {
                        username: conversation.messages[0].sender.username,
                        profile: {
                            name: conversation.messages[0].sender.profile!.name,
                            profilePicture: conversation.messages[0].sender.profile!.profilePicture,
                        }
                    },
                    receiver: {
                        username: conversation.messages[0].receiver.username,
                        profile: {
                            name: conversation.messages[0].receiver.profile!.name,
                            profilePicture: conversation.messages[0].receiver.profile!.profilePicture,
                        }
                    },
                } : null,
            })) as ConversationCardType[];

            const conversationsEnd = conversations.length === 0
                ? true
                : oldestConversationId === conversations.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ conversations: ConversationCardType[], cursor: string | null, end: boolean }> = {
                success: true,
                data: {
                    conversations: conversations ?? [],
                    cursor: conversations.slice(-1)[0]?.id ?? null,
                    end: conversationsEnd
                },
            };

            res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getSpecificConversation = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const conversationId = req.params.id;
    const cursor = req.query.cursor;

    try {
        if (cursor) {
            const conversation = await getConversation(conversationId);
            if (!conversation) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
            if (!conversation.participants.some(participant => participant.user.username === user.username)) throw new AppError('User unauthorized to view the conversation', 403, 'UNAUTHORIZED');

            // check if conversation is empty
            if (conversation.messages.length === 0) {
                const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: number | null, end: boolean }> = {
                    success: true,
                    data: {
                        messages: [],
                        cursor: null,
                        end: true,
                    },
                };

                res.status(200).json(successResponse);
            }

            const oldestMessageId = await getFirstMessage(conversationId).then(res => res?.messages[0].id);
            if (oldestMessageId) {
                if (cursor === oldestMessageId) {
                    const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            messages: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    res.status(200).json(successResponse);
                }
            }

            const messages = await getMessages(conversationId, String(cursor)).then(res => res?.messages);

            let allMsgsOrdered: ConversationMessageType[] = [];
            if (messages !== undefined && messages.length !== 0) {
                allMsgsOrdered = messages
                    .map((msg) => ({
                        id: msg.id,
                        content: msg.content,
                        images: msg.images,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt,
                        sentBy: msg.sender.username,
                        readStatus: msg.readStatus,
                        status: 'sent'
                    }))
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as ConversationMessageType[];
            }

            const messagesEnd = allMsgsOrdered.length === 0
                ? true
                : oldestMessageId === allMsgsOrdered[0].id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: string | null, end: boolean }> = {
                success: true,
                data: {
                    messages: allMsgsOrdered ?? [],
                    cursor: allMsgsOrdered?.[0].id ?? null,
                    end: messagesEnd
                },
            };

            res.status(200).json(successResponse);
        } else {
            const conversation = await getConversation(conversationId);
            if (!conversation) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
            if (!conversation.participants.some(participant => participant.user.username === user.username)) throw new AppError('User unauthorized to view the conversation', 403, 'UNAUTHORIZED');

            // check if conversation is empty
            if (conversation.messages.length === 0) {
                const successResponse: SuccessResponse<{ conversation: ConversationType }> = {
                    success: true,
                    data: {
                        conversation: {
                            id: conversation.id,

                            participants: conversation.participants.map((participant) => {
                                return {
                                    username: participant.user.username,
                                    createdAt: participant.user.createdAt,
                                    profile: {
                                        name: participant.user.profile!.name,
                                        bio: participant.user.profile!.bio,
                                        profilePicture: participant.user.profile!.profilePicture,
                                    },
                                    stats: {
                                        followersCount: participant.user._count.followers,
                                    }
                                };
                            }),

                            messages: [],
                            cursor: null,
                            end: true,
                        }
                    },
                };

                res.status(200).json(successResponse);
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
            } else if (conversation.messages.filter(msg => msg.id === firstMessageId).length === 0) {
                // if there's no unread message, fetch all messages by using first message as a cursor
                olderMsgs = await getMessages(conversationId, firstMessageId).then(res => res?.messages);
            }

            const allMsgs = olderMsgs ? [...olderMsgs, ...conversation.messages] : [...conversation.messages];

            let allMsgsOrdered: ConversationMessageType[] = [];
            if (allMsgs.length !== 0) {
                allMsgsOrdered = allMsgs
                    .map((msg) => ({
                        id: msg.id,
                        content: msg.content,
                        images: msg.images,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt,
                        sentBy: msg.sender.username,
                        readStatus: msg.readStatus,
                        status: 'sent'
                    }))
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as ConversationMessageType[];
            }

            const messagesEnd = allMsgsOrdered.length === 0
                ? true
                : firstMessageId === allMsgsOrdered[0].id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ conversation: ConversationType }> = {
                success: true,
                data: {
                    conversation: {
                        id: conversation.id,

                        participants: conversation.participants.map((participant) => {
                            return {
                                username: participant.user.username,
                                createdAt: participant.user.createdAt,
                                profile: {
                                    name: participant.user.profile!.name,
                                    bio: participant.user.profile!.bio,
                                    profilePicture: participant.user.profile!.profilePicture,
                                },
                                stats: {
                                    followersCount: participant.user._count.followers,
                                }
                            };
                        }),

                        messages: allMsgsOrdered,
                        cursor: allMsgsOrdered[0]?.id ?? null,
                        end: messagesEnd,
                    }
                },
            };

            res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
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

export const createConversationMessage = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const text = req.body.text;
    const conversationId = req.body.conversationId;
    const images = req.body.cloudinaryUrls;

    try {
        if (!conversationId) throw new AppError('Conversation ID is missing', 404, 'MISSING_CONVERSATION');

        if ((text === undefined || text.length === 0) && (images === undefined || images.length === 0)) {
            throw new AppError('Message content is missing', 404, 'MISSING_CONTENT');
        }

        const conversation = await getConversationParticipans(conversationId);
        if (!conversation) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
        if (!conversation.participants.some(participant => participant.userId === user.id)) throw new AppError('User unauthorized to view the conversation', 403, 'UNAUTHORIZED');

        const receiver = conversation.participants.filter((particiapnt) => particiapnt.userId !== user.id);
        if (receiver.length === 0) {
            // save logged in user if both participants share same id (logged in user self-conversation)
            receiver.push({ userId: user.id });
        }

        const newMessage = await createMessage(user.id, receiver[0].userId, text, images, conversationId);
        if (!newMessage) throw new AppError('Could not create a new message', 400, 'FAILED_NEW_MESSAGE');

        const successResponse: SuccessResponse<{ message: ConversationMessageType }> = {
            success: true,
            data: {
                message: {
                    id: newMessage.id,
                    content: newMessage.content ?? undefined,
                    images: newMessage.images,
                    createdAt: newMessage.createdAt,
                    updatedAt: newMessage.createdAt,
                    sentBy: user.username,
                    readStatus: false,
                    status: 'sent'
                }
            },
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

