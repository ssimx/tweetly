import { Prisma, PrismaClient } from '@prisma/client';
import { ProfileInfo } from '../lib/types';
import { AppError } from 'tweetly-shared';
const prisma = new PrismaClient();

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
};

// ---------------------------------------------------------------------------------------------------------

export const updateUserEmail = async (id: number, newEmail: string) => {
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

export const isUserDeactivated = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            deactivatedAt: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const deactivateUser = async (id: number) => {
    return await prisma.user.update({
        where: { id },
        data: {
            deactivatedAt: new Date(Date.now()),
        },
        select: {
            id: true,
            deactivatedAt: true,
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
                    profilePicture: true,
                }
            },
            followers: {
                where: {
                    follower: {
                        id: userId
                    }
                },
                select: {
                    followerId: true
                }
            },
            following: {
                where: {
                    followee: {
                        id: userId
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
            _count: {
                select: {
                    followers: true,
                    following: true,
                }
            }
        },
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getUserByUsername = async (username: string) => {
    const user = await prisma.user.findUnique({
        where: {
            username
        },
        select: {
            username: true,
        },
    });

    if (user) return user;

    const temporaryUser = await prisma.temporaryUser.findUnique({
        where: {
            username
        },
        select: {
            username: true,
        },
    });

    return temporaryUser;
};

// ---------------------------------------------------------------------------------------------------------

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            email: true,
        },
    });

    if (user) return user;

    const temporaryUser = await prisma.temporaryUser.findUnique({
        where: {
            email
        },
        select: {
            email: true,
        },
    });

    return temporaryUser;
};