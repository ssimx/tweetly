import { PrismaClient } from '@prisma/client';
import { UserProps } from '../lib/types';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewPost = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.followerNotification.findMany({
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

    return await prisma.postNotification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewReply = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.followerNotification.findMany({
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

    return await prisma.postNotification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewRepost = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.followerNotification.findMany({
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

    return await prisma.postNotification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewLike = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.followerNotification.findMany({
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

    return await prisma.postNotification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createNotificationsForNewFollower = async (postId: number, authorId: number) => {
    // fetch all followers who have notifications enabled for the author
    const followers = await prisma.followerNotification.findMany({
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

    return await prisma.postNotification.createMany({
        data: notifications
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removeNotificationsForPost = async (postId: number, notifierId: number) => {
    return await prisma.postNotification.deleteMany({
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
    return await prisma.postNotification.deleteMany({
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
    return await prisma.postNotification.deleteMany({
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
    return await prisma.postNotification.deleteMany({
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
    return await prisma.postNotification.deleteMany({
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

export const getNotifications = async (username: string, userId: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    const posts = await prisma.postNotification.findMany({
        where: {
            AND: [
                {
                    receiverId: userId
                },
                {
                    type: {
                        name: 'POST'
                    }
                },
                {
                    createdAt: {
                        gte: date
                    }
                }
            ]
        },
        select: {
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
                    reposts: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true
                        }
                    },
                    likes: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true
                        }
                    },
                    bookmarks: {
                        where: {
                            user: {
                                username
                            }
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

    const replies = await prisma.postNotification.findMany({
        where: {
            AND: [
                {
                    receiverId: userId
                },
                {
                    type: {
                        name: 'REPLY'
                    }
                },
                {
                    createdAt: {
                        gte: date
                    }
                }
            ]
        },
        select: {
            post: {
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
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
                            reposts: {
                                where: {
                                    user: {
                                        username
                                    }
                                },
                                select: {
                                    userId: true
                                }
                            },
                            likes: {
                                where: {
                                    user: {
                                        username
                                    }
                                },
                                select: {
                                    userId: true
                                }
                            },
                            bookmarks: {
                                where: {
                                    user: {
                                        username
                                    }
                                },
                                select: {
                                    userId: true
                                }
                            },
                            _count: {
                                select: {
                                    replies: true,
                                    reposts: true,
                                    likes: true
                                }
                            }
                        }
                    },
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
                    reposts: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true
                        }
                    },
                    likes: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true
                        }
                    },
                    bookmarks: {
                        where: {
                            user: {
                                username
                            }
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

    const likes = await prisma.postNotification.findMany({
        where: {
            AND: [
                {
                    receiverId: userId
                },
                {
                    type: {
                        name: 'LIKE'
                    }
                },
                {
                    createdAt: {
                        gte: date
                    }
                }
            ]
        },
        select: {
            post: {
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    replyTo: {
                        select: {
                            author: {
                                select: {
                                    username: true,
                                    profile: {
                                        select: {
                                            name: true,
                                            profilePicture: true,
                                            bio: true
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
                            }
                        }
                    },
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
                    reposts: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true
                        }
                    },
                    likes: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true
                        }
                    },
                    bookmarks: {
                        where: {
                            user: {
                                username
                            }
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

    const reposts = await prisma.postNotification.findMany({
        where: {
            AND: [
                {
                    receiverId: userId
                },
                {
                    type: {
                        name: 'REPOST'
                    }
                },
                {
                    createdAt: {
                        gte: date
                    }
                }
            ]
        },
        select: {
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
                    reposts: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true,
                            createdAt: true,
                        }
                    },
                    likes: {
                        where: {
                            user: {
                                username
                            }
                        },
                        select: {
                            userId: true,
                        }
                    },
                    bookmarks: {
                        where: {
                            user: {
                                username
                            }
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

    const follows = await prisma.followNotification.findMany({
        where: {
            AND: [
                {
                    receiverId: userId
                },
                {
                    type: {
                        name: 'FOLLOW'
                    }
                },
                {
                    createdAt: {
                        gte: date
                    }
                }
            ]
        },
        select: {
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
            }
        }
    });

    return {
        posts,
        replies,
        likes,
        reposts,
        follows
    };
};

// ---------------------------------------------------------------------------------------------------------
