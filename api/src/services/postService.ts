import { Post, Prisma, PrismaClient, Profile, User } from '@prisma/client';
import { UserProps } from '../lib/types';
import { createNotificationsForNewLike, createNotificationsForNewRepost, removeNotificationsForLike, removeNotificationsForRepost } from './notificationService';
import { NewPostProps } from '../controllers/postController';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const getGlobal30DayPosts = async (userId: number, cursor?: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    createdAt: {
                        gte: date
                    }
                },
                {
                    replyToId: null
                },
                {
                    author: {
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 25,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            replyToId: true,
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
                            followerId: userId,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            likes: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            bookmarks: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            _count: {
                select: {
                    likes: true,
                    reposts: true,
                    replies: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestGlobal30DayPost = async (userId: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    createdAt: {
                        gte: date
                    }
                },
                {
                    replyToId: null
                },
                {
                    author: {
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            id: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getFollowing30DayPosts = async (userId: number, cursor?: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    createdAt: {
                        gte: date
                    }
                },
                {
                    replyToId: null
                },
                {
                    author: {
                        NOT: {
                            id: userId,
                        },
                        followers: {
                            some: {
                                followerId: userId
                            }
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId
                            }
                        }
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 25,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            replyToId: true,
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
                            followerId: userId,
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
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            likes: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            bookmarks: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            _count: {
                select: {
                    likes: true,
                    reposts: true,
                    replies: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestFollowing30DayPost = async (userId: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    createdAt: {
                        gte: date
                    }
                },
                {
                    replyToId: null
                },
                {
                    author: {
                        NOT: {
                            id: userId,
                        },
                        followers: {
                            some: {
                                followerId: userId
                            }
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId
                            }
                        }
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            id: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getPostReplies = async (userId: number, postId: number, cursor?: number) => {
    return await prisma.post.findMany({
        where: {
            replyToId: postId,
        },
        orderBy: [
            {
                replies: {
                    _count: 'desc'
                },
            },
            {
                reposts: {
                    _count: 'desc'
                }
            },
            {
                likes: {
                    _count: 'desc'
                },
            },
            {
                createdAt: 'desc'
            },
        ],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 15,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            replyToId: true,
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
                            followerId: userId,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            likes: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            bookmarks: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            _count: {
                select: {
                    likes: true,
                    reposts: true,
                    replies: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getPostInfo = async (userId: number, postId: number) => {
    return await prisma.post.findUnique({
        where: { 
            id: postId
        },
        select: {
            id: true,
            content: true,
            images: true,
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
                            followerId: userId,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
                    images: true,
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
                                    followerId: userId,
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
                            blockedBy: {
                                where: {
                                    blockerId: userId,
                                },
                                select: {
                                    blockerId: true,
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
                            userId: userId,
                        },
                        select: {
                            userId: true,
                        }
                    },
                    likes: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            userId: true,
                        }
                    },
                    bookmarks: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            userId: true,
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            reposts: true,
                            replies: true,
                        }
                    }
                }
            },
            replies: {
                take: 15,
                select: {
                    id: true,
                    content: true,
                    images: true,
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
                                    followerId: userId,
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
                            blockedBy: {
                                where: {
                                    blockerId: userId,
                                },
                                select: {
                                    blockerId: true,
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
                            userId: userId,
                        },
                        select: {
                            userId: true,
                        }
                    },
                    likes: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            userId: true,
                        }
                    },
                    bookmarks: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            userId: true,
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            reposts: true,
                            replies: true,
                        }
                    }
                }
            },
            reposts: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            likes: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            bookmarks: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                }
            },
            _count: {
                select: {
                    likes: true,
                    reposts: true,
                    replies: true,
                }
            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestReplyLeastEnegagement = async (userId:number, parentPostId: number) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    replyToId: parentPostId
                },
                {
                    author: {
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    }
                }
            ]
            
        },
        orderBy: [
            {
                replies: {
                    _count: 'asc'
                },
            },
            {
                reposts: {
                    _count: 'asc'
                }
            },
            {
                likes: {
                    _count: 'asc'
                },
            },
            {
                createdAt: 'asc'
            },
        ],
        take: 1,
        select: {
            id: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getPostsBySearch = async (userId: number, searchTerms: string[]) => {
    return await prisma.post.findMany({
        where: {
            OR: searchTerms.map((term) => ({
                AND: [
                    {
                        content: { contains: term, mode: 'insensitive' },
                    },
                    {
                        author: {
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        }
                    },
                ],
            })),
        },
        distinct: 'id',
        orderBy: [
            {
                replies: {
                    _count: 'asc'
                },
            },
            {
                reposts: {
                    _count: 'asc'
                }
            },
            {
                likes: {
                    _count: 'asc'
                },
            },
            {
                createdAt: 'asc'
            },
        ],
        take: 15,
        select: {
            id: true,
            content: true,
            images: true,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
                    userId: userId,
                },
                select: {
                    userId: true
                }
            },
            likes: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true
                }
            },
            bookmarks: {
                where: {
                    userId: userId,
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
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getLastPostBySearch = async (userId: number, searchTerms: string[]) => {
    return await prisma.post.findMany({
        where: {
            OR: searchTerms.map((term) => ({
                AND: [
                    {
                        content: { contains: term, mode: 'insensitive' },
                    },
                    {
                        author: {
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        }
                    },
                    {

                    },
                ],
            })),
        },
        distinct: 'id',
        orderBy: [
            {
                replies: {
                    _count: 'desc'
                },
            },
            {
                reposts: {
                    _count: 'desc'
                }
            },
            {
                likes: {
                    _count: 'desc'
                },
            },
            {
                createdAt: 'desc'
            },
        ],
        take: 1,
        select: {
            id: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getMorePostsBySearch = async (userId: number, searchTerms: string[], cursor: number) => {
    return await prisma.post.findMany({
        where: {
            OR: searchTerms.map((term) => ({
                AND: [
                    {
                        content: { contains: term, mode: 'insensitive' },
                    },
                    {
                        author: {
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        }
                    },
                ],
            })),
        },
        distinct: 'id',
        orderBy: [
            {
                replies: {
                    _count: 'asc'
                },
            },
            {
                reposts: {
                    _count: 'asc'
                }
            },
            {
                likes: {
                    _count: 'asc'
                },
            },
            {
                createdAt: 'asc'
            },
        ],
        skip: 1,
        cursor: { id: cursor },
        take: 15,
        select: {
            id: true,
            content: true,
            images: true,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
                    userId: userId,
                },
                select: {
                    userId: true
                }
            },
            likes: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true
                }
            },
            bookmarks: {
                where: {
                    userId: userId,
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
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getTopPosts = async (userId: number) => {
    let day = 30;

    // Infer the type of newPosts and assign it to posts
    type PostWithRelations = Prisma.PostGetPayload<{
        select: {
            id: true;
            content: true;
            createdAt: true;
            updatedAt: true;
            author: {
                select: {
                    username: true;
                    profile: {
                        select: {
                            name: true;
                            bio: true;
                            profilePicture: true;
                        };
                    };
                    followers: {
                        where: { followerId: number };
                        select: { followerId: true };
                    };
                    following: {
                        where: { followeeId: number };
                        select: { followeeId: true };
                    };
                    _count: {
                        select: {
                            followers: true;
                            following: true;
                        };
                    };
                };
            };
            reposts: {
                where: { userId: number };
                select: { userId: true };
            };
            likes: {
                where: { userId: number };
                select: { userId: true };
            };
            bookmarks: {
                where: { userId: number };
                select: { userId: true };
            };
            _count: {
                select: {
                    replies: true;
                    reposts: true;
                    likes: true;
                };
            };
        };
    }>;
    let posts: PostWithRelations[] = [];

    do {
        let date = new Date();
        date.setDate(date.getDate() - day);

        const newPosts = await prisma.post.findMany({
            where: {
                AND: [
                    {
                        author: {
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        },
                    },
                    {
                        replyTo: null
                    },
                    {
                        createdAt: {
                            gte: date
                        }
                    }
                ]


            },
            orderBy: [
                {
                    replies: {
                        _count: 'desc',
                    },
                },
                {
                    reposts: {
                        _count: 'desc',
                    },
                },
                {
                    likes: {
                        _count: 'desc',
                    },
                },
                {
                    createdAt: 'desc',
                },
            ],
            take: 30 - posts.length,
            select: {
                id: true,
                content: true,
                images: true,
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
                        blockedBy: {
                            where: {
                                blockerId: userId,
                            },
                            select: {
                                blockerId: true,
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
                        userId: userId,
                    },
                    select: {
                        userId: true
                    }
                },
                likes: {
                    where: {
                        userId: userId,
                    },
                    select: {
                        userId: true
                    }
                },
                bookmarks: {
                    where: {
                        userId: userId,
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
        })

        posts = [...posts, ...newPosts];
        
        day *= 2;
    } while (posts.length !== 30);

    return posts;
};

// ---------------------------------------------------------------------------------------------------------

export const getTrendingHastags = async () => {
    return await prisma.hashtag.findMany({
        take: 20,
        orderBy: {
            posts: {
                _count: 'desc',
            }
        },
        select: {
            name: true,
            _count: {
                select: {
                    posts: true,
                }
            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------
// ---------- PROFILE INFO ----------------
//                  |
//                  V

export const getPosts = async (userId: number, username: string, cursor?: number) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    author: {
                        AND: [
                            {
                                username
                            },
                            {
                                blockedUsers: {
                                    none: {
                                        blockedId: userId
                                    }
                                }
                            }
                        ]
                    },
                },
                {
                    replyToId: null
                },
                {
                    // skip user's posts which were reposted to avoid duplication
                    reposts: {
                        none: {
                            user: {
                                username: username,
                            }
                        }
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestPost = async (username: string) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    author: {
                        username: username,
                    },
                },
                {
                    replyToId: null
                },
                {
                    reposts: {
                        none: {
                            user: {
                                username: username,
                            }
                        }
                    }
                }
            ]

        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            id: true,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getReposts = async (userId: number, username: string, cursor?: number) => {
    return await prisma.post.findMany({
        where: {
            reposts: {
                some: {
                    user: {
                        username: username
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestRepost = async (username: string) => {
    return await prisma.post.findMany({
        where: {
            reposts: {
                some: {
                    user: {
                        username: username
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            id: true,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getReplies = async (userId: number, username: string, cursor?: number) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    author: {
                        username: username,
                    },
                },
                {
                    replyToId: {
                        not: null
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
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
                            blockedBy: {
                                where: {
                                    blockerId: userId,
                                },
                                select: {
                                    blockerId: true,
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
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestReply = async (username: string) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    author: {
                        username: username,
                    },
                },
                {
                    replyToId: {
                        not: null
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            id: true,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getMedia = async (userId: number, username: string, cursor?: number) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    author: {
                        AND: [
                            {
                                username
                            },
                            {
                                blockedUsers: {
                                    none: {
                                        blockedId: userId
                                    }
                                }
                            }
                        ]
                    },
                },
                {
                    images: {
                        isEmpty: false
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
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
                        blockedBy: {
                            where: {
                                blockerId: userId,
                            },
                            select: {
                                blockerId: true,
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
                    blockedBy: {
                        where: {
                            blockerId: userId,
                        },
                        select: {
                            blockerId: true,
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
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestMedia = async (username: string) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    author: {
                        username
                    },
                },
                {
                    images: {
                        isEmpty: false
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            id: true,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getLikes = async (userId: number, username: string, cursor?: number) => {
    return await prisma.postLike.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { postLikeId: { postId: cursor, userId: userId } } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            post: {
                select: {
                    id: true,
                    content: true,
                    images: true,
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
                                    blockedBy: {
                                        where: {
                                            blockerId: userId,
                                        },
                                        select: {
                                            blockerId: true,
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
                            blockedBy: {
                                where: {
                                    blockerId: userId,
                                },
                                select: {
                                    blockerId: true,
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
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestLike = async (userId: number) => {
    return await prisma.postLike.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            post: {
                select: {
                    id: true,
                }
            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getBookmarks = async (userId: number, username: string, cursor?: number) => {
    return await prisma.postBookmark.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'desc'
        },
        cursor: cursor ? { postBookmarkId: { postId: cursor, userId: userId } } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            post: {
                select: {
                    id: true,
                    content: true,
                    images: true,
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
                                    blockedBy: {
                                        where: {
                                            blockerId: userId,
                                        },
                                        select: {
                                            blockerId: true,
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
                            blockedBy: {
                                where: {
                                    blockerId: userId,
                                },
                                select: {
                                    blockerId: true,
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
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestBookmark = async (userId: number) => {
    return await prisma.postBookmark.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1,
        select: {
            post: {
                select: {
                    id: true,
                }
            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------
// ---------- SETTER FUNCTIONS ----------------
//                    |
//                    V

// ---------------------------------------------------------------------------------------------------------

export const postExists = async (id: number) => {
    return await prisma.post.findUnique({
        where: { id },
    })
};

// ---------------------------------------------------------------------------------------------------------

export const handlePostHashtags = async (postId: number, hashtags: string[]) => {
    try {
        // First, upsert hashtags and get their IDs
        const upsertedHashtags = await Promise.all(
            hashtags.map((tag) =>
                prisma.hashtag.upsert({
                    where: { name: tag },
                    update: {}, // Ensure the tag exists without modifying it
                    create: { name: tag },
                })
            )
        );

        // Now create the many-to-many relationships between Post and Hashtags
        const hashtagOnPostData = upsertedHashtags.map((hashtag) => ({
            postId,
            hashtagId: hashtag.id, // Access the ID of the upserted hashtag
        }));

        // Perform the createMany operation
        await prisma.hashtagOnPost.createMany({
            data: hashtagOnPostData,
            skipDuplicates: true, // Prevent duplicates
        });
    } catch (error) {
        console.error('Error handling post hashtags:', error);
        throw new Error('Failed to process hashtags');
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addPost = async (userId: number, postData: NewPostProps) => {
    try {
        const post = await prisma.post.create({
            data: {
                content: postData.text,
                images: postData.images,
                replyToId: postData.replyToId,
                authorId: userId,
            }
        })

        return { post };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (error.code === 'P2002') {
                console.log(
                    'There is a content length constraint violation, a new post cannot exceed 280 characters'
                )
            }
        }

        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addPostRepost = async (userId: number, postId: number) => {
    try {
        return await prisma.postRepost.create({
            data: {
                postId,
                userId,
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Unique constraint violation (e.g. username or email already exists)
                return { error: 'Unique constraint violation', fields: (error.meta?.target as string[]) ?? [] };
            }
        }

        // Throw the error so it can be handled in the registerUser function
        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removePostRepost = async (userId: number, postId: number) => {
    return await prisma.postRepost.delete({
        where: {
            postRepostId: { postId, userId },
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const addPostLike = async (userId: number, postId: number) => {
    try {
        return await prisma.postLike.create({
            data: {
                postId,
                userId,
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: 'Unique constraint violation', fields: (error.meta?.target as string[]) ?? [] };
            }
        }

        // Throw the error so it can be handled in the registerUser function
        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removePostLike = async (userId: number, postId: number) => {
    return await prisma.postLike.delete({
        where: {
            postLikeId: { postId, userId },
        },
    })
};

// ---------------------------------------------------------------------------------------------------------

export const addPostBookmark = async (userId: number, postId: number) => {
    try {
        return await prisma.postBookmark.create({
            data: {
                postId,
                userId,
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: 'Unique constraint violation', fields: (error.meta?.target as string[]) ?? [] };
            }
        }

        // Throw the error so it can be handled in the registerUser function
        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removePostBookmark = async (userId: number, postId: number) => {
    return await prisma.postBookmark.delete({
        where: {
            postBookmarkId: { postId, userId },
        },
    })
};