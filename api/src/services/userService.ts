import { Prisma, PrismaClient } from '@prisma/client';
import { ProfileInfo, UserProps } from '../lib/types';
import { removeNotificationsForFollow } from './notificationService';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const getUser = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            dateOfBirth: true,
            profile: { // include profile information
                select: {
                    name: true,
                    bio: true,
                    location: true,
                    websiteUrl: true,
                    profilePicture: true,
                    bannerPicture: true,
                }
            },
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getProfile = async (userId: number, username: string) => {
    return await prisma.user.findUnique({
        where: {
            username,
        },
        select: {
            username: true,
            createdAt: true,
            profile: {
                select: {
                    name: true,
                    bio: true,
                    location: true,
                    websiteUrl: true,
                    profilePicture: true,
                    bannerPicture: true,
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
                    followeeId: userId
                },
                select: {
                    followeeId: true
                }
            },
            blockedBy: {
                where: {
                    blockerId: userId,
                },
                select: {
                    blockerId: true,
                }
            },
            blockedUsers: {
                where: {
                    blockedId: userId,
                },
                select: {
                    blockedId: true,
                }
            },
            notifying: {
                where: {
                    receiverId: userId,
                },
                select: {
                    receiverId: true,
                }
            },
            conversationsParticipant: {
                where: {
                    conversation: {
                        participants: {
                            some: {
                                userId: userId,
                            }
                        }
                    }
                },
                select: {
                    conversation: {
                        select: {
                            id: true,
                        }
                    }
                }
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const updateProfile = async (id: number, data: ProfileInfo) => {
    return await prisma.profile.update({
        where: {
            userId: id,
        },
        data: {
            name: data.name,
            bio: data.bio,
            location: data.location,
            websiteUrl: data.website,
            bannerPicture: data.bannerPicture,
            profilePicture: data.profilePicture
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getFollowers = async (userId: number, username: string, cursor?: string) => {
    let followerId: number | null | undefined;
    let followeeId: number | null | undefined;
    
    if (cursor) {
        followerId = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        }).then(res => res?.id);

        if (!followerId) return;

        followeeId = await prisma.user.findUnique({
            where: { username: cursor },
            select: { id: true }
        }).then(res => res?.id);

        if (!followeeId) return;
    }

    return await prisma.follow.findMany({
        where: {
            followee: {
                username: username
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 25,
        skip: followeeId ? 1 : 0,
        cursor: followerId && followeeId ? { followId: { followerId, followeeId } } : undefined,
        select: {
            follower: {
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
                            follower: {
                                username: username
                            }
                        },
                        select: {
                            followerId: true
                        }
                    },
                    following: {
                        where: {
                            followee: {
                                username: username
                            }
                        },
                        select: {
                            followeeId: true
                        }
                    },
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
                        }
                    },
                    blockedUsers: {
                        where: {
                            blockedId: userId,
                        },
                        select: {
                            blockedId: true,
                        }
                    },
                    notifying: {
                        where: {
                            receiverId: userId,
                        },
                        select: {
                            receiverId: true,
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
};

// ---------------------------------------------------------------------------------------------------------

export const getFollowing = async (userId: number, username: string, cursor?: string) => {
    let followerId: number | null | undefined;
    let followeeId: number | null | undefined;

    if (cursor) {
        followerId = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        }).then(res => res?.id);

        if (!followerId) return;

        followeeId = await prisma.user.findUnique({
            where: { username: cursor },
            select: { id: true }
        }).then(res => res?.id);

        if (!followeeId) return;
    }

    return await prisma.follow.findMany({
        where: {
            follower: {
                username: username
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 25,
        skip: followeeId ? 1 : 0,
        cursor: followerId && followeeId ? { followId: { followerId, followeeId } } : undefined,
        select: {
            followee: {
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
                            follower: {
                                username: username
                            }
                        },
                        select: {
                            followerId: true
                        }
                    },
                    following: {
                        where: {
                            followee: {
                                username: username
                            }
                        },
                        select: {
                            followeeId: true
                        }
                    },
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
                        }
                    },
                    blockedUsers: {
                        where: {
                            blockedId: userId,
                        },
                        select: {
                            blockedId: true,
                        }
                    },
                    notifying: {
                        where: {
                            receiverId: userId,
                        },
                        select: {
                            receiverId: true,
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
};

// ---------------------------------------------------------------------------------------------------------

export const getUserId = async (username: string) => {
    return await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const addPushNotifications = async (userId: number, username: string) => {
    const followee = await prisma.user.findUnique({
        where: {
            username,
        },
        select: {
            id: true,
            followers: {
                where: {
                    followerId: userId
                }
            }
        }
    });

    if (!followee) {
        throw new Error("User not found");
    } else if (followee.followers.length === 0) {
        throw new Error("Logged in user doesn't follow the user");
    }

    try {
        return await prisma.pushNotification.create({
            data: {
                receiverId: userId,
                notifierId: followee.id
            }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw { error: 'Unique constraint violation' };
            }
        }

        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removePushNotfications = async (userId: number, username: string) => {
    const notifier = await prisma.user.findUnique({
        where: {
            username,
        },
        select: {
            id: true
        }
    });

    if (!notifier) {
        throw new Error("User not found");
    }

    return await prisma.pushNotification.delete({
        where: {
            pushNotificationId: { receiverId: userId, notifierId: notifier.id },
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const addFollow = async (userId: number, username: string) => {
    const followee = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true
        }
    });

    if (!followee) {
        throw new Error('User not found');
    }

    try {
        const newFollow = await prisma.follow.create({
            data: {
                followerId: userId,
                followeeId: followee.id
            }
        });

        if (!newFollow) throw new Error("User not found or is already beeing followed");

        await prisma.notification.create({
            data: {
                notifierId: userId,
                receiverId: followee.id,
                typeId: 4,
            }
        });

        return true;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw { error: 'Unique constraint violation' };
            }
        }

        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeFollow = async (followerId: number, username: string) => {
    const followeeId = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true
        }
    }).then((res) => res?.id);

    if (!followeeId) {
        throw new Error('User not found');
    }

    const removed = await prisma.follow.delete({
        where: {
            followId: { followerId, followeeId }
        }
    });

    if (!removed) throw new Error('Logged in user is not following the user');;

    removeNotificationsForFollow(followerId, followeeId);

    return true;
};

// ---------------------------------------------------------------------------------------------------------

export const addBlock = async (userId: number, username: string) => {
    const blocked = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true
        }
    });

    if (!blocked) {
        throw new Error('User not found');
    }

    await prisma.follow.deleteMany({
        where: {
            OR: [
                {
                    followeeId: userId,
                    followerId: blocked.id
                },
                {
                    followeeId: blocked.id,
                    followerId: userId
                },
            ]
        }
    })

    return await prisma.block.create({
        data: {
            blockerId: userId,
            blockedId: blocked.id
        }
    })
}

// ---------------------------------------------------------------------------------------------------------

export const removeBlock = async (blockerId: number, username: string) => {
    const blockedId = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true
        }
    }).then(res => res?.id);

    if (!blockedId) {
        throw new Error('User not found');
    }

    return await prisma.block.delete({
        where: {
            blockId: { blockerId, blockedId }
        }
    })
}