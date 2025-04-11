import { Prisma, PrismaClient } from '@prisma/client';
import { AppError, getErrorMessage } from 'tweetly-shared';

const prisma = new PrismaClient({
    errorFormat: 'minimal',
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// ---------------------------------------------------------------------------------------------------------

export const getUser = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            createdAt: true,
            username: true,
            email: true,
            dateOfBirth: true,
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
            _count: {
                select: {
                    following: true,
                    followers: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getTemporaryUser = async (id: number) => {
    return await prisma.temporaryUser.findUnique({
        where: { id },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getUserPassword = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            password: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const updateUserUsername = async (id: number, newUsername: string) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: {
                username: newUsername,
            },
            select: {
                id: true,
                username: true,
                email: true,
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Unique constraint violation (e.g. username or email already exists)
                return { error: 'Unique constraint violation', fields: (error.meta?.target as string[]) ?? [] };
            }
        }

        return { error: getErrorMessage(error), fields: [] };
    }
};

// ---------------------------------------------------------------------------------------------------------

export const updateUserEmail = async (id: number, newEmail: string) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: {
                email: newEmail,
            },
            select: {
                id: true,
                username: true,
                email: true,
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Unique constraint violation (e.g. username or email already exists)
                return { error: 'Unique constraint violation', fields: (error.meta?.target as string[]) ?? [] };
            }
        }

        return { error: getErrorMessage(error), fields: [] };
    }
};

// ---------------------------------------------------------------------------------------------------------

export const updateUserPassword = async (id: number, newPassword: string) => {
    return await prisma.user.update({
        where: { id },
        data: {
            password: newPassword,
        },
        select: {
            id: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const updateUserBirthday = async (id: number, newBirthday: Date) => {
    return await prisma.user.update({
        where: { id },
        data: {
            dateOfBirth: newBirthday,
        },
        select: {
            id: true,
            dateOfBirth: true,
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

export const updateProfile = async (
    id: number,
    data: {
        name: string,
        bio?: string,
        location?: string,
        website?: string,
        profilePicture?: string,
        bannerPicture?: string,
    }) => {

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
        },
        select: {
            name: true,
            bio: true,
            location: true,
            websiteUrl: true,
            profilePicture: true,
            bannerPicture: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getFollowers = async (userId: number, username: string, cursor?: string) => {
    if (!cursor) {
        return await prisma.follow.findMany({
            where: {
                followee: {
                    username: username
                }
            },
            orderBy: [
                {
                    createdAt: 'desc'
                },
                {
                    followerId: 'desc',
                },
                {
                    followeeId: 'desc'
                }
            ],
            take: 25,
            select: {
                follower: {
                    select: {
                        username: true,
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
                                followerId: userId,
                            },
                            select: {
                                followerId: true,
                            },
                        },
                        following: {
                            where: {
                                followeeId: userId,
                            },
                            select: {
                                followeeId: true,
                            },
                        },
                        blockedBy: {
                            where: {
                                blockerId: userId,
                            },
                            select: {
                                blockerId: true,
                            },
                        },
                        blockedUsers: {
                            where: {
                                blockedId: userId,
                            },
                            select: {
                                blockedId: true,
                            }
                        },
                        _count: {
                            select: {
                                followers: true,
                                following: true,
                            },
                        },
                    },
                }
            }
        });
    } else {
        const followeeId = await prisma.user.findFirst({
            where: {
                username: username,
            },
            select: {
                id: true,
            }
        }).then(res => res?.id);
        if (!followeeId) throw new AppError("User doesn't exist", 404, 'INVALID_USER');

        const followerId = await prisma.user.findFirst({
            where: {
                username: cursor,
            },
            select: {
                id: true,
            }
        }).then(res => res?.id);
        if (!followerId) throw new AppError("Follower cursor doesn't exist", 404, 'INVALID_CURSOR');

        return await prisma.follow.findMany({
            where: {
                followee: {
                    username: username
                }
            },
            orderBy: [
                {
                    createdAt: 'desc'
                },
                {
                    followeeId: 'desc',
                },
                {
                    followerId: 'desc'
                }
            ],
            take: 25,
            skip: 1,
            cursor: { followId: { followerId: followerId, followeeId: followeeId! } },
            select: {
                follower: {
                    select: {
                        username: true,
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
                                followerId: userId,
                            },
                            select: {
                                followerId: true,
                            },
                        },
                        following: {
                            where: {
                                followeeId: userId,
                            },
                            select: {
                                followeeId: true,
                            },
                        },
                        blockedBy: {
                            where: {
                                blockerId: userId,
                            },
                            select: {
                                blockerId: true,
                            },
                        },
                        blockedUsers: {
                            where: {
                                blockedId: userId,
                            },
                            select: {
                                blockedId: true,
                            }
                        },
                        _count: {
                            select: {
                                followers: true,
                                following: true,
                            },
                        },
                    },
                }
            }
        });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestFollower = async (username: string) => {
    return await prisma.follow.findFirst({
        where: {
            followee: {
                username: username
            }
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                followerId: 'asc',
            },
            {
                followeeId: 'asc'
            }
        ],
        select: {
            follower: {
                select: {
                    username: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getFollowing = async (userId: number, username: string, cursor?: string) => {
    if (!cursor) {
        return await prisma.follow.findMany({
            where: {
                follower: {
                    username: username
                }
            },
            orderBy: [
                {
                    createdAt: 'desc'
                },
                {
                    followerId: 'desc',
                },
                {
                    followeeId: 'desc'
                }
            ],
            take: 25,
            select: {
                followee: {
                    select: {
                        username: true,
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
                                followerId: userId,
                            },
                            select: {
                                followerId: true,
                            },
                        },
                        following: {
                            where: {
                                followeeId: userId,
                            },
                            select: {
                                followeeId: true,
                            },
                        },
                        blockedBy: {
                            where: {
                                blockerId: userId,
                            },
                            select: {
                                blockerId: true,
                            },
                        },
                        blockedUsers: {
                            where: {
                                blockedId: userId,
                            },
                            select: {
                                blockedId: true,
                            }
                        },
                        _count: {
                            select: {
                                followers: true,
                                following: true,
                            },
                        },
                    },
                }
            }
        });
    } else {
        const followerId = await prisma.user.findFirst({
            where: {
                username: username,
            },
            select: {
                id: true,
            }
        }).then(res => res?.id);
        if (!followerId) throw new AppError("User doesn't exist", 404, 'INVALID_USER');

        const followeeId = await prisma.user.findFirst({
            where: {
                username: cursor,
            },
            select: {
                id: true,
            }
        }).then(res => res?.id);
        if (!followeeId) throw new AppError("Followee cursor doesn't exist", 404, 'INVALID_CURSOR');

        return await prisma.follow.findMany({
            where: {
                follower: {
                    username: username
                }
            },
            orderBy: [
                {
                    createdAt: 'desc'
                },
                {
                    followeeId: 'desc',
                },
                {
                    followerId: 'desc'
                }
            ],
            take: 25,
            skip: 1,
            cursor: { followId: { followerId: followerId, followeeId: followeeId! } },
            select: {
                followee: {
                    select: {
                        username: true,
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
                                followerId: userId,
                            },
                            select: {
                                followerId: true,
                            },
                        },
                        following: {
                            where: {
                                followeeId: userId,
                            },
                            select: {
                                followeeId: true,
                            },
                        },
                        blockedBy: {
                            where: {
                                blockerId: userId,
                            },
                            select: {
                                blockerId: true,
                            },
                        },
                        blockedUsers: {
                            where: {
                                blockedId: userId,
                            },
                            select: {
                                blockedId: true,
                            }
                        },
                        _count: {
                            select: {
                                followers: true,
                                following: true,
                            },
                        },
                    },
                }
            }
        });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestFollowing = async (username: string) => {
    return await prisma.follow.findFirst({
        where: {
            follower: {
                username: username
            }
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                followerId: 'asc',
            },
            {
                followeeId: 'asc'
            }
        ],
        select: {
            followee: {
                select: {
                    username: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

interface SuggestionType {
    id: number;
    username: string;
    profile: {
        name: string;
        bio: string;
        location: string,
        websiteUrl: string,
        bannerPicture: string,
        profilePicture: string,
    } | null;
    followers: {
        followerId: number;
    }[];
    following: {
        followeeId: number;
    }[];
    blockedBy: {
        blockerId: number;
    }[];
    blockedUsers: {
        blockedId: number;
    }[];
    _count: {
        followers: number,
        following: number
    };
}

export const getFollowSuggestions = async (userId: number) => {
    // Step 1: Fetch the last 20 users followed by the logged-in user
    const recentFollowees = await prisma.follow.findMany({
        where: {
            followerId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20,
        select: {
            followeeId: true,
        },
    });

    const recentFolloweeIds = recentFollowees.map((follow) => follow.followeeId);

    // Step 2: Fetch the last 20 users followed by each of these 20 users
    const suggestions = await prisma.follow.findMany({
        where: {
            followerId: {
                in: recentFolloweeIds,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20 * recentFolloweeIds.length, // Fetch up to 20 for each user
        select: {
            followee: {
                select: {
                    id: true,
                    username: true,
                    createdAt: true,
                    profile: {
                        select: {
                            name: true,
                            bio: true,
                            location: true,
                            websiteUrl: true,
                            bannerPicture: true,
                            profilePicture: true,
                        },
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        }
                    }
                }
            },
        },
    });

    if (suggestions.length < 20) {
        // If user doesn't follow anyone or there's just not enough suggestions,
        //      fetch 20 most relevant users
        const suggestions = await prisma.user.findMany({
            where: {
                id: {
                    not: userId
                }
            },
            orderBy: {
                followers: {
                    _count: 'desc'
                }
            },
            take: 20,
            select: {
                username: true,
                createdAt: true,
                profile: {
                    select: {
                        name: true,
                        bio: true,
                        location: true,
                        websiteUrl: true,
                        bannerPicture: true,
                        profilePicture: true,
                    },
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
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    }
                }
            }
        });

        return suggestions;
    }

    const filteredSuggestions = suggestions.filter((entry) => entry.followee.followers.length === 0 && entry.followee.id !== userId);

    // Step 3: Aggregate and count occurrences of users
    const userFrequency: Record<number, { count: number; user: SuggestionType }> = {};
    for (const { followee } of filteredSuggestions) {
        if (!userFrequency[followee.id]) {
            userFrequency[followee.id] = { count: 0, user: followee };
        }
        userFrequency[followee.id].count++;
    }

    // Step 4: Order by most frequent and return top 20
    const sortedSuggestions = Object.values(userFrequency)
        .sort((a, b) => b.count - a.count) // Sort by frequency (count)
        .slice(0, 20) // Take top 20
        .map(({ user }) => {
            const { username, profile, followers, following, blockedBy, blockedUsers, _count } = user;
            return { username, profile, followers, following, blockedBy, blockedUsers, _count };
        });


    return sortedSuggestions;
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
    try {
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
        if (!followee) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        else if (followee.followers.length === 0) throw new AppError('User is not followed', 400, 'USER_NOT_FOLLOWED');

        await prisma.pushNotification.create({
            data: {
                receiverId: userId,
                notifierId: followee.id
            }
        })

        return true;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') throw new AppError('Notifications already enabled', 400, 'NOTIFICATIONS_ALREADY_ENABLED');
        }

        if (error instanceof AppError) throw error;

        throw new AppError('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removePushNotfications = async (userId: number, username: string) => {
    try {
        const notifier = await prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true
            }
        });
        if (!notifier) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

        await prisma.pushNotification.delete({
            where: {
                pushNotificationId: { receiverId: userId, notifierId: notifier.id },
            }
        })

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addFollow = async (userId: number, username: string) => {
    try {
        const followee = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true
            }
        });
        if (!followee) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

        await prisma.follow.create({
            data: {
                followerId: userId,
                followeeId: followee.id
            }
        });

        return true;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') throw new AppError('User is already being followed', 400, 'USER_ALREADY_FOLLOWED');
        }

        if (error instanceof AppError) throw error;

        throw new AppError('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeFollow = async (followerId: number, username: string) => {
    try {
        const followeeId = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true
            }
        }).then((res) => res?.id);
        if (!followeeId) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

        const removed = await prisma.follow.delete({
            where: {
                followId: { followerId, followeeId }
            }
        });
        if (!removed) throw new AppError('User is not being followed', 404, 'USER_NOT_FOLLOWED');

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addBlock = async (userId: number, username: string) => {
    try {
        const blockedUser = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true
            }
        });
        if (!blockedUser) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

        // remove follow
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    {
                        followeeId: userId,
                        followerId: blockedUser.id
                    },
                    {
                        followeeId: blockedUser.id,
                        followerId: userId
                    },
                ]
            }
        })

        await prisma.block.create({
            data: {
                blockerId: userId,
                blockedId: blockedUser.id
            }
        })

        return true;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') throw new AppError('User is already blocked', 400, 'USER_ALREADY_BLOCKED');
        }

        if (error instanceof AppError) throw error;

        throw new AppError('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
}

// ---------------------------------------------------------------------------------------------------------

export const removeBlock = async (blockerId: number, username: string) => {
    try {
        const blockedId = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true
            }
        }).then(res => res?.id);
        if (!blockedId) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

        const unblocked = await prisma.block.delete({
            where: {
                blockId: { blockerId, blockedId }
            }
        })
        if (!unblocked) throw new AppError('User is not blocked', 404, 'USER_NOT_BLOCKED');

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
}

// ---------------------------------------------------------------------------------------------------------

export const getUsersBySearch = async (userId: number, searchTerms: string[]) => {
    return await prisma.user.findMany({
        where: {
            OR: searchTerms.map((term) => ({
                AND: [
                    {
                        OR: [
                            { username: { contains: term, mode: 'insensitive' } },
                            { profile: { name: { contains: term, mode: 'insensitive' } } },
                        ],
                    },
                    {
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                    {
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                ],
            })),
        },
        take: 10,
        select: {
            username: true,
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
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getUserByUsername = async (username: string) => {
    const user = await prisma.user.findFirst({
        where: {
            username: {
                contains: username,
                mode: 'insensitive',
            },
        },
        select: {
            username: true,
        },
    });

    if (user) return user;

    const temporaryUser = await prisma.temporaryUser.findFirst({
        where: {
            username: {
                contains: username,
                mode: 'insensitive',
            },
        },
        select: {
            username: true,
        },
    });

    return temporaryUser;
};

// ---------------------------------------------------------------------------------------------------------

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email: {
                contains: email,
                mode: 'insensitive',
            },
        },
        select: {
            email: true,
        },
    });

    if (user) return user;

    const temporaryUser = await prisma.temporaryUser.findFirst({
        where: {
            email: {
                contains: email,
                mode: 'insensitive',
            },
        },
        select: {
            email: true,
        },
    });

    return temporaryUser;
};