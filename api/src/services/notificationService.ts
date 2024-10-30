import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewPost = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.pushNotification.findMany({
        where: {
            notifierId: authorId,
        },
        select: {
            receiverId: true,
        }
    });

    // create a notification for each follower
    const notifications = followers.map(follower => ({
        typeId: 0,
        postId: postId,
        notifierId: authorId,
        receiverId: follower.receiverId,
    }));

    return await prisma.notification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewReply = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.pushNotification.findMany({
        where: {
            notifierId: authorId,
        },
        select: {
            receiverId: true,
        }
    });

    // create a notification for each follower
    const notifications = followers.map(follower => ({
        typeId: 1,
        postId: postId,
        notifierId: authorId,
        receiverId: follower.receiverId,
    }));

    return await prisma.notification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewRepost = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.pushNotification.findMany({
        where: {
            notifierId: authorId,
        },
        select: {
            receiverId: true,
        }
    });

    // create a notification for each follower
    const notifications = followers.map(follower => ({
        typeId: 2,
        postId: postId,
        notifierId: authorId,
        receiverId: follower.receiverId,
    }));

    return await prisma.notification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewLike = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.pushNotification.findMany({
        where: {
            notifierId: authorId,
        },
        select: {
            receiverId: true,
        }
    });

    // create a notification for each follower
    const notifications = followers.map(follower => ({
        typeId: 3,
        postId: postId,
        notifierId: authorId,
        receiverId: follower.receiverId,
    }));

    return await prisma.notification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewFollower = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.pushNotification.findMany({
        where: {
            notifierId: authorId,
        },
        select: {
            receiverId: true,
        }
    });

    // create a notification for each follower
    const notifications = followers.map(follower => ({
        typeId: 4,
        postId: postId,
        notifierId: authorId,
        receiverId: follower.receiverId,
    }));

    return await prisma.notification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removeNotificationsForPost = async (postId: number, notifierId: number) => {
    return await prisma.notification.deleteMany({
        where: {
            AND: [
                {
                    typeId: 0
                },
                {
                    postId
                },
                {
                    notifierId: notifierId
                }
            ]
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removeNotificationsForReply = async (postId: number, notifierId: number) => {
    return await prisma.notification.deleteMany({
        where: {
            AND: [
                {
                    typeId: 1
                },
                {
                    postId
                },
                {
                    notifierId: notifierId
                }
            ]
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removeNotificationsForRepost = async (postId: number, notifierId: number) => {
    return await prisma.notification.deleteMany({
        where: {
            AND: [
                {
                    typeId: 2
                },
                {
                    postId
                },
                {
                    notifierId: notifierId
                }
            ]
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removeNotificationsForLike = async (postId: number, notifierId: number) => {
    return await prisma.notification.deleteMany({
        where: {
            AND: [
                {
                    typeId: 3
                },
                {
                    postId
                },
                {
                    notifierId: notifierId
                }
            ]
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removeNotificationsForFollow = async (postId: number, notifierId: number) => {
    return await prisma.notification.deleteMany({
        where: {
            AND: [
                {
                    typeId: 4
                },
                {
                    postId
                },
                {
                    notifierId: notifierId
                }
            ]
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getNotifications = async (userId: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);
    return await prisma.notification.findMany({
        where: {
            receiverId: userId,
            createdAt: {
                gte: date,
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            type: {
                select: {
                    name: true,
                    description: true,
                },
            },
            isRead: true,
            notifier: {
                select: {
                    username: true,
                    profile: {
                        select: {
                            name: true,
                            bio: true,
                            profilePicture: true,
                        }
                    },
                    followers: {
                        where: {
                            followerId: userId
                        },
                        select: {
                            followerId: true
                        }
                    },
                    following: {
                        where: {
                            followeeId: userId,
                        },
                        select: {
                            followeeId: true,
                        }
                    },
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        }
                    }
                }
            },
            post: {
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    author: {
                        select: {
                            username: true,
                            profile: {
                                select: {
                                    name: true,
                                    bio: true,
                                    profilePicture: true,
                                }
                            },
                            followers: {
                                where: {
                                    followerId: userId
                                },
                                select: {
                                    followerId: true
                                }
                            },
                            following: {
                                where: {
                                    followeeId: userId,
                                },
                                select: {
                                    followeeId: true,
                                }
                            },
                            _count: {
                                select: {
                                    followers: true,
                                    following: true,
                                }
                            }
                        }
                    },
                    replyTo: {
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                            updatedAt: true,
                            author: {
                                select: {
                                    username: true,
                                    profile: {
                                        select: {
                                            name: true,
                                            bio: true,
                                            profilePicture: true,
                                        }
                                    },
                                    followers: {
                                        where: {
                                            followerId: userId
                                        },
                                        select: {
                                            followerId: true
                                        }
                                    },
                                    following: {
                                        where: {
                                            followeeId: userId,
                                        },
                                        select: {
                                            followeeId: true,
                                        }
                                    },
                                    _count: {
                                        select: {
                                            followers: true,
                                            following: true,
                                        }
                                    }
                                }
                            },
                        }
                    },
                    reposts: {
                        where: {
                            userId
                        },
                        select: {
                            userId: true
                        }
                    },
                    likes: {
                        where: {
                            userId
                        },
                        select: {
                            userId: true
                        }
                    },
                    bookmarks: {
                        where: {
                            userId
                        },
                        select: {
                            userId: true
                        }
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        }
                    }
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const updateNotificationsToRead = async (userId: number) => {
    return await prisma.notification.updateMany({
        where: {
            receiverId: userId,
        },
        data: {
            isRead: true,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getNotificationsReadStatus = async (userId: number) => {
    return await prisma.notification.findFirst({
        where: {
            receiverId: userId,
            isRead: false
        },
        select: {
            id: true,
        }
    })
};