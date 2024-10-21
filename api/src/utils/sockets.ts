import { Server } from 'socket.io';
import { PrismaClient } from "@prisma/client";
import { Server as HttpServer } from 'http';
import { getNotifications, getNotificationsReadStatus } from '../services/notificationService';

const prisma = new PrismaClient();

interface ServerToClientEvents {
    new_following_post: () => void;
    new_global_post: () => void;
    new_notification: () => void;
    notification_read_status: (status: boolean) => void;
};

interface ClientToServerEvents {
    get_following: (userId: number) => void;
    get_notifications: (userId: number) => void;
    new_following_post: (authorId: number) => void;
    new_user_notification: (userId: number) => void;
    new_global_post: () => void;
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

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    })
};

export { socketConnection };
