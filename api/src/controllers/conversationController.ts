import { NextFunction, Request, Response } from 'express';
import { UserProps } from '../lib/types';
import { getUserId } from '../services/userService';
import { createConversation, createMessage, getAllConversations, getConversation, getConversationParticipans, getFirstMessage, getFirstUnreadMessage, getLastMessage, getLatestMessages, getNewerMessages, getOlderMessages, getOldestConversation, updateConversationUpdatedAtTime, updateMessagesReadStatus } from '../services/conversationService';
import { AppError, ConversationCardType, ConversationMessageType, SuccessResponse, ConversationType, LoggedInUserDataType } from 'tweetly-shared';
import { io } from '../utils/sockets';
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

                    return res.status(200).json(successResponse);
                }
            }

            const conversationsData = await getAllConversations(user.id, cursor as string);
            const conversations = conversationsData.map((conversation) => ({
                id: conversation.id,
                updatedAt: conversation.updatedAt,
                lastMessage: conversation.messages.length ? {
                    id: conversation.messages[0].id,
                    createdAt: conversation.messages[0].createdAt,
                    content: conversation.messages[0].content,
                    readAt: conversation.messages[0].readAt,
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

            return res.status(200).json(successResponse);
        } else {
            const oldestConversationId = await getOldestConversation(user.id).then(res => res?.id);
            const conversationsData = await getAllConversations(user.id, cursor as string);

            const conversations = conversationsData.map((conversation) => ({
                id: conversation.id,
                updatedAt: conversation.updatedAt,
                lastMessage: conversation.messages.length ? {
                    id: conversation.messages[0].id,
                    createdAt: conversation.messages[0].createdAt,
                    content: conversation.messages[0].content,
                    images: conversation.messages[0].images,
                    readAt: conversation.messages[0].readAt ?? undefined,
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

            return res.status(200).json(successResponse);
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
    const type = req.query.type;

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

                return res.status(200).json(successResponse);
            }

            if (type === 'old') {
                const oldestMessageId = await getFirstMessage(conversationId).then(res => res?.messages[0].id);
                if (oldestMessageId) {
                    if (cursor === oldestMessageId) {
                        const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: number | null, topReached: boolean }> = {
                            success: true,
                            data: {
                                messages: [],
                                cursor: null,
                                topReached: true,
                            },
                        };

                        return res.status(200).json(successResponse);
                    }
                }

                const messages = await getOlderMessages(conversationId, String(cursor)).then(res => res?.messages);

                let mappedMessages: ConversationMessageType[] = [];
                if (messages !== undefined && messages.length !== 0) {
                    mappedMessages = messages
                        .map((msg) => ({
                            id: msg.id,
                            content: msg.content,
                            images: msg.images,
                            createdAt: msg.createdAt,
                            updatedAt: msg.updatedAt,
                            sentBy: msg.sender.username,
                            readAt: msg.readAt ?? undefined,
                            status: 'sent'
                        }))
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as ConversationMessageType[];
                }

                const topReached = mappedMessages.length === 0
                    ? true
                    : oldestMessageId === mappedMessages[0].id
                        ? true
                        : false

                const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: string | null, topReached: boolean }> = {
                    success: true,
                    data: {
                        messages: mappedMessages ?? [],
                        cursor: mappedMessages?.[0].id ?? null,
                        topReached: topReached
                    },
                };

                return res.status(200).json(successResponse);
            } else if (type === 'new') {
                const newestMessageId = await getLastMessage(conversationId).then(res => res?.messages[0].id);
                if (newestMessageId) {
                    if (cursor === newestMessageId) {
                        const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: number | null, bottomReached: boolean }> = {
                            success: true,
                            data: {
                                messages: [],
                                cursor: null,
                                bottomReached: true,
                            },
                        };

                        return res.status(200).json(successResponse);
                    }
                }

                const messages = await getNewerMessages(conversationId, String(cursor)).then(res => res?.messages);

                let mappedMessages: ConversationMessageType[] = [];
                if (messages !== undefined && messages.length !== 0) {
                    mappedMessages = messages
                        .map((msg) => ({
                            id: msg.id,
                            content: msg.content,
                            images: msg.images,
                            createdAt: msg.createdAt,
                            updatedAt: msg.updatedAt,
                            sentBy: msg.sender.username,
                            readAt: msg.readAt ?? undefined,
                            status: 'sent'
                        })) as ConversationMessageType[]
                    // .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as ConversationMessageType[];
                }

                const bottomReached = mappedMessages.length === 0
                    ? true
                    : newestMessageId === mappedMessages.slice(-1)[0].id
                        ? true
                        : false

                const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: string | null, bottomReached: boolean }> = {
                    success: true,
                    data: {
                        messages: mappedMessages ?? [],
                        cursor: mappedMessages?.slice(-1)[0].id ?? null,
                        bottomReached: bottomReached
                    },
                };

                return res.status(200).json(successResponse);
            } else {
                throw new AppError('Incorrect cursor type', 401, 'INCORRECT_TYPE');
            }
        } else {
            // fetch conversation information including latest 25 messages
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
                            topCursor: null,
                            topReached: true,
                            bottomCursor: null,
                            bottomReached: true,
                        }
                    },
                };

                return res.status(200).json(successResponse);
            }

            // if not, find first and last message
            const oldestMessageId = await getFirstMessage(conversationId).then(res => res?.messages[0].id as string);
            const newestMessageId = await getLastMessage(conversationId).then(res => res?.messages[0].id as string);
            // and first unread message from not logged in user (other party)
            const firstUnreadMessage = await getFirstUnreadMessage(conversationId, user.id);

            // update read status of all messages from the other party, by using first unread message timestamp
            if (firstUnreadMessage) updateMessagesReadStatus(conversationId, user.id, firstUnreadMessage.createdAt);

            // if both first and last message ID's are in the conversation initial cluster, no need to fetch anything else
            if (conversation.messages.filter((msg) => msg.id === oldestMessageId || msg.id === newestMessageId).length === 2) {
                let allMsgsOrdered: ConversationMessageType[] = [];
                allMsgsOrdered = conversation.messages
                    .map((msg) => ({
                        id: msg.id,
                        content: msg.content,
                        images: msg.images,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt,
                        sentBy: msg.sender.username,
                        readAt: msg.readAt ?? undefined,
                        status: 'sent'
                    }))
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as ConversationMessageType[];

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
                            topCursor: allMsgsOrdered[0]?.id ?? null,
                            topReached: true,
                            bottomCursor: allMsgsOrdered.slice(-1)[0]?.id ?? null,
                            bottomReached: true,
                        }
                    },
                };

                return res.status(200).json(successResponse);
            }

            // if there's unread message, fetch 25 older and 25 newer messages, use unread message as a cursor
            // otherwise proceed with conversation initial messages cluster
            let messages = conversation.messages;
            if (firstUnreadMessage) {
                const olderMessages = await getOlderMessages(conversationId, firstUnreadMessage.id).then(res => res?.messages) ?? [];
                const newerMessages = await getNewerMessages(conversationId, firstUnreadMessage.id).then(res => res?.messages) ?? [];
                messages = [...newerMessages, firstUnreadMessage, ...olderMessages];
            }

            let allMsgsOrdered: ConversationMessageType[] = [];
            if (messages.length !== 0) {
                allMsgsOrdered = messages
                    .map((msg) => ({
                        id: msg.id,
                        content: msg.content,
                        images: msg.images,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt,
                        sentBy: msg.sender.username,
                        readAt: msg.readAt ?? undefined,
                        status: 'sent'
                    }))
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as ConversationMessageType[];
            }

            const messagesTopReached = allMsgsOrdered.length === 0
                ? true
                : oldestMessageId === allMsgsOrdered[0].id
                    ? true
                    : false

            const messagesBottomReached = allMsgsOrdered.length === 0
                ? true
                : newestMessageId === allMsgsOrdered.slice(-1)[0].id
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
                        topCursor: allMsgsOrdered[0]?.id ?? null,
                        topReached: messagesTopReached,
                        bottomCursor: allMsgsOrdered.slice(-1)[0]?.id ?? null,
                        bottomReached: messagesBottomReached,
                    }
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const createEmptyConversation = async (req: Request, res: Response) => {
    const { id } = req.user as LoggedInUserDataType;
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
    const tempId = req.body.tempId;
    const text = req.body.text;
    const conversationId = req.body.conversationId;
    const images = req.body.cloudinaryUrls;

    try {
        if (!conversationId) throw new AppError('Conversation ID is missing', 404, 'MISSING_CONVERSATION');

        if (tempId === undefined) throw new AppError('Message temporary ID is missing', 404, 'MISSING_TEMP_ID');

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
                    tempId: tempId,
                    content: newMessage.content ?? undefined,
                    images: newMessage.images,
                    createdAt: newMessage.createdAt,
                    updatedAt: newMessage.createdAt,
                    sentBy: user.username,
                    status: 'sent'
                }
            },
        };

        // Emit new message to the receiver
        if (newMessage.receiverId !== user.id) {
            io.to(`user_${newMessage.receiverId}_messages`).emit('new_message');
        }

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

