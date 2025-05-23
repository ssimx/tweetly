import { Server } from 'socket.io';
import { PrismaClient } from "@prisma/client";
import { BasePostDataType, } from 'tweetly-shared';
import { Server as HttpServer } from 'http';
import { getNotificationsReadStatus } from '../services/notificationService.js';
import { updateMessageReadStatus, getMessagesReadStatus, updateConversationMessagesReadStatus } from '../services/conversationService.js';

const prisma = new PrismaClient({
    errorFormat: 'minimal',
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// ---------------------------------------------------------------------------------------------------------

interface ServerToClientEvents {
    new_following_post: (newPost: BasePostDataType) => void;
    new_global_post: (newPost: BasePostDataType) => void;
    new_notification: () => void;
    new_message: () => void;
    notification_read_status: (status: boolean) => void;
    conversation_seen: (joinedUser: string) => void,
    message_read_status: (status: boolean) => void;
    message_received: (message: { content: string, createdAt: Date, username: string }) => void;
    message_typing_status: (typingUser: null | string) => void;
    message_seen: (messageId: string) => void;
};

interface ClientToServerEvents {
    get_following: (userId: number) => void;
    get_notifications: (userId: number) => void;
    new_global_post: (newPost: BasePostDataType) => void;
    new_following_post: (authorId: number, newPost: BasePostDataType) => void;
    new_user_notification: (userId: number) => void;
    new_user_message: (userId: number) => void;
    join_conversation_room: (conversationId: string, joinedUser: string) => void;
    new_conversation_message: (conversationId: string, message: { content: string, createdAt: Date, username: string }) => void;
    conversation_typing_status: (conversationId: string, typingUser: null | string) => void;
    conversation_seen_status: (conversationId: string, messageId: string) => void;
};

interface InterServerEvents {
    ping: () => void;
};

interface SocketData {
    name: string;
    age: number;
};

let io: Server;

const socketConnection = (server: HttpServer) => {
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? ['https://tweetly-ten.vercel.app']
        : ['http://192.168.1.155:3000', 'http://localhost:3000'];

    io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
        }
    });

    io.on("connection", (socket) => {
        console.log('connected');

        // Fetch the list of users the connected user is following
        socket.on('get_following', async (userId) => {
            // Fetch the list of users that user follows
            const following = await prisma.follow.findMany({
                where: {
                    followerId: userId
                },
                select: {
                    followeeId: true
                }
            });

            // Store the user's followers in the socket session
            socket.join(following.map((user) => `user_${user.followeeId}`));
        });

        socket.on('get_notifications', async (userId) => {

            const pushNotificationUsers = await prisma.user.findMany({
                where: {
                    AND: [
                        {
                            followers: {
                                some: {
                                    followerId: userId
                                }
                            }
                        },
                        {
                            notifying: {
                                some: {
                                    receiverId: userId
                                }
                            }
                        }
                    ]


                },
                select: {
                    id: true,
                }
            });

            // Store the user's followers in the socket session
            socket.join(pushNotificationUsers.map((user) => `user_${user.id}`));
            socket.join(`user_${userId}_messages`);

            const notificationsReadStatus = await getNotificationsReadStatus(userId);
            const messagesReadStatus = await getMessagesReadStatus(userId);

            socket.emit('notification_read_status', notificationsReadStatus !== null);
            socket.emit('message_read_status', messagesReadStatus !== null);
        });

        socket.on('new_following_post', (authorId, newPost) => {
            socket.to(`user_${authorId}`).emit('new_following_post', newPost);
        });

        socket.on('new_global_post', (newPost) => {
            socket.broadcast.emit('new_global_post', newPost);
        })

        socket.on('new_user_notification', (userId) => {
            socket.to(`user_${userId}`).emit('new_user_notification');
        });

        socket.on('join_conversation_room', async (conversationId, joinedUser) => {
            socket.join(`${conversationId}`);
            socket.to(`${conversationId}`).emit('conversation_seen', joinedUser);
            updateConversationMessagesReadStatus(conversationId, joinedUser);
        });

        socket.on('conversation_typing_status', async (conversationId, typingUser) => {
            socket.to(`${conversationId}`).emit('message_typing_status', typingUser);
        });

        socket.on('new_conversation_message', async (conversationId, message) => {
            socket.to(`${conversationId}`).emit('message_received', message);
        });

        socket.on('new_conversation_message_seen', async (conversationId, messageId) => {
            socket.to(`${conversationId}`).emit('message_seen', messageId);
            updateMessageReadStatus(conversationId, messageId);
        });

        socket.on('new_user_message', async (receiverId) => {
            socket.to(`user_${receiverId}_messages`).emit('new_message');
        });

    })
};

export { io, socketConnection };
