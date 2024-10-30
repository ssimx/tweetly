import { Server } from 'socket.io';
import { PrismaClient } from "@prisma/client";
import { Server as HttpServer } from 'http';
import { getNotifications, getNotificationsReadStatus } from '../services/notificationService';
import { updateMessageReadStatus } from '../services/conversationService';

const prisma = new PrismaClient();

interface ServerToClientEvents {
    new_following_post: () => void;
    new_global_post: () => void;
    new_notification: () => void;
    notification_read_status: (status: boolean) => void;
    message_received: (message: { content: string, createdAt: Date, username: string }) => void;
    message_typing_status: (status: boolean) => void;
    message_seen: (messageId?: string) => void;
};

interface ClientToServerEvents {
    get_following: (userId: number) => void;
    get_notifications: (userId: number) => void;
    new_following_post: (authorId: number) => void;
    new_user_notification: (userId: number) => void;
    new_global_post: () => void;
    join_conversation_room: (conversationId: string) => void;
    new_conversation_message: (conversationId: string, message: { content: string, createdAt: Date, username: string }) => void;
    conversation_typing_status: (conversationId: string, status: boolean) => void;
    conversation_seen_status: (conversationId: string, messageId: string) => void;
};

interface InterServerEvents {
    ping: () => void;
};

interface SocketData {
    name: string;
    age: number;
};

const socketConnection = (server: HttpServer) => {
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server, {
        cors: {
            origin: "http://localhost:3000"
        }
    });

    io.on("connection", (socket) => {
        console.log('user connected');

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

            const notificationsReadStatus = await getNotificationsReadStatus(userId);
            
            socket.emit('notification_read_status', notificationsReadStatus !== null);
        });

        socket.on('new_following_post', (authorId) => {
            socket.to(`user_${authorId}`).emit('new_following_post');
        });

        socket.on('new_global_post', () => {
            socket.broadcast.emit('new_global_post',);
        })

        socket.on('new_user_notification', (userId) => {
            socket.to(`user_${userId}`).emit('new_notification');
        });

        socket.on('join_conversation_room', async (conversationId) => {
            socket.join(`${conversationId}`);
        });

        socket.on('conversation_typing_status', async (conversationId, status) => {
                socket.to(`${conversationId}`).emit('message_typing_status', status);
            }
        );

        socket.on('new_conversation_message', async (conversationId, message) => {
            socket.to(`${conversationId}`).emit('message_received', message);
        }
        );

        socket.on('conversation_seen_status', async (conversationId, messageId) => {
            // Update message read status to read
            if (messageId) updateMessageReadStatus(conversationId, messageId)
            socket.to(`${conversationId}`).emit('message_seen', messageId);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    })
};

export { socketConnection };
