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

export const getUserPassword = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            password: true,
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
        profilePicture: string;
    } | null;
    followers: {
        followerId: number;
    }[];
    following: {
        followeeId: number;
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
                                id: userId,
                            }
                        },
                        select: {
                            followerId: true
                        }
                    },
                    following: {
                        where: {
                            followee: {
                                id: userId,
                            }
                        },
                        select: {
                            followeeId: true
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
            const { username, profile, followers, following, _count } = user;
            return { username, profile, followers, following, _count };
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
                    {
                        id: {
                            not: userId
                        }
                    }
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
        },
    })
};

// ---------------------------------------------------------------------------------------------------------
