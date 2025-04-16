import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from 'tweetly-shared';
import { NewPostType } from '../controllers/postController.js';

const prisma = new PrismaClient({
    errorFormat: 'minimal',
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// ---------------------------------------------------------------------------------------------------------

export const getGlobal30DayPosts = async (userId: number, cursor?: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    isDeleted: false,
                },
                {
                    createdAt: {
                        gte: date,
                    },
                },
                {
                    replyToId: null,
                },
                {
                    author: {
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 25,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    createdAt: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestGlobal30DayPost = async (userId: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findFirst({
        where: {
            AND: [
                {
                    isDeleted: false,
                },
                {
                    createdAt: {
                        gte: date,
                    },
                },
                {
                    replyToId: null,
                },
                {
                    author: {
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                id: 'asc',
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getGlobal30DayNewPosts = async (
    userId: number,
    cursor?: number
) => {
    const cursorDate = await prisma.post
        .findUnique({
            where: {
                id: cursor,
            },
            select: {
                createdAt: true,
            },
        })
        .then((res) => res?.createdAt);
    if (!cursorDate) return [];

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    isDeleted: false,
                },
                {
                    createdAt: {
                        gt: cursorDate,
                    },
                },
                {
                    replyToId: null,
                },
                {
                    author: {
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        take: 25,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    createdAt: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getFollowing30DayPosts = async (
    userId: number,
    cursor?: number
) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    isDeleted: false,
                },
                {
                    createdAt: {
                        gte: date,
                    },
                },
                {
                    replyToId: null,
                },
                {
                    author: {
                        NOT: {
                            id: userId,
                        },
                        followers: {
                            some: {
                                followerId: userId,
                            },
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 25,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    createdAt: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestFollowing30DayPost = async (userId: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findFirst({
        where: {
            AND: [
                {
                    isDeleted: false,
                },
                {
                    createdAt: {
                        gte: date,
                    },
                },
                {
                    replyToId: null,
                },
                {
                    author: {
                        NOT: {
                            id: userId,
                        },
                        followers: {
                            some: {
                                followerId: userId,
                            },
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                id: 'asc',
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getFollowing30DayNewPosts = async (
    userId: number,
    cursor?: number
) => {
    const cursorDate = await prisma.post
        .findUnique({
            where: {
                id: cursor,
            },
            select: {
                createdAt: true,
            },
        })
        .then((res) => res?.createdAt);
    if (!cursorDate) return [];

    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    isDeleted: false,
                },
                {
                    createdAt: {
                        gt: cursorDate,
                    },
                },
                {
                    replyToId: null,
                },
                {
                    author: {
                        NOT: {
                            id: userId,
                        },
                        followers: {
                            some: {
                                followerId: userId,
                            },
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        take: 25,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    createdAt: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getPostInfo = async (userId: number, postId: number) => {
    return await prisma.post.findUnique({
        where: {
            id: postId,
        },
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    isDeleted: true,
                    pinnedOnProfile: {
                        select: {
                            pinnedPostId: true,
                        }
                    },
                    author: {
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
                            _count: {
                                select: {
                                    followers: true,
                                    following: true,
                                },
                            },
                        },
                    },
                    reposts: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                            createdAt: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    bookmarks: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        },
                    },
                },
            },
            replies: {
                orderBy: [
                    {
                        replies: {
                            _count: 'asc',
                        },
                    },
                    {
                        reposts: {
                            _count: 'asc',
                        },
                    },
                    {
                        likes: {
                            _count: 'asc',
                        },
                    },
                    {
                        createdAt: 'asc',
                    },
                    {
                        id: 'asc'
                    }
                ],
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    isDeleted: true,
                    pinnedOnProfile: {
                        select: {
                            pinnedPostId: true,
                        }
                    },
                    author: {
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
                    },
                    reposts: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    bookmarks: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        },
                    },
                }
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getPostReplies = async (
    userId: number,
    postId: number,
    cursor?: number
) => {
    return await prisma.post.findMany({
        where: {
            replyToId: postId,
            author: {
                blockedUsers: {
                    none: {
                        blockedId: userId,
                    },
                },
                blockedBy: {
                    none: {
                        blockerId: userId,
                    },
                },
            },
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
            {
                id: 'desc'
            }
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
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestReplyLeastEnegagement = async (
    userId: number,
    parentPostId: number
) => {
    return await prisma.post.findFirst({
        where: {
            AND: [
                {
                    replyToId: parentPostId,
                },
                {
                    author: {
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                        blockedBy: {
                            none: {
                                blockerId: userId,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                replies: {
                    _count: 'asc',
                },
            },
            {
                reposts: {
                    _count: 'asc',
                },
            },
            {
                likes: {
                    _count: 'asc',
                },
            },
            {
                createdAt: 'asc',
            },
            {
                id: 'asc'
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getPostsBySearch = async (
    userId: number,
    searchTerms: string[],
    cursor?: number,
) => {
    return await prisma.post.findMany({
        where: {
            OR: searchTerms.map((term) => ({
                AND: [
                    {
                        isDeleted: false
                    },
                    {
                        content: { contains: term, mode: 'insensitive' },
                    },
                    {
                        author: {
                            blockedUsers: {
                                none: {
                                    blockedId: userId,
                                },
                            },
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        },
                    },
                ],
            })),
        },
        orderBy: [
            {
                replies: {
                    _count: 'asc',
                },
            },
            {
                reposts: {
                    _count: 'asc',
                },
            },
            {
                likes: {
                    _count: 'asc',
                },
            },
            {
                createdAt: 'asc',
            },
            {
                id: 'asc'
            }
        ],
        cursor: cursor ? { id: cursor } : undefined,
        take: 15,
        skip: cursor ? 1 : 0,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
            },
            reposts: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                },
            },
            likes: {
                where: {
                    userId: userId,
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getLastPostBySearch = async (
    userId: number,
    searchTerms: string[]
) => {
    return await prisma.post.findFirst({
        where: {
            OR: searchTerms.map((term) => ({
                AND: [
                    {
                        isDeleted: false
                    },
                    {
                        content: { contains: term, mode: 'insensitive' },
                    },
                    {
                        author: {
                            blockedUsers: {
                                none: {
                                    blockedId: userId,
                                },
                            },
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        },
                    },
                    {},
                ],
            })),
        },
        distinct: 'id',
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
            {
                id: 'desc'
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getMorePostsBySearch = async (
    userId: number,
    searchTerms: string[],
    cursor: number
) => {
    return await prisma.post.findMany({
        where: {
            OR: searchTerms.map((term) => ({
                AND: [
                    {
                        isDeleted: false
                    },
                    {
                        content: { contains: term, mode: 'insensitive' },
                    },
                    {
                        author: {
                            blockedUsers: {
                                none: {
                                    blockedId: userId,
                                },
                            },
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        },
                    },
                ],
            })),
        },
        distinct: 'id',
        orderBy: [
            {
                replies: {
                    _count: 'asc',
                },
            },
            {
                reposts: {
                    _count: 'asc',
                },
            },
            {
                likes: {
                    _count: 'asc',
                },
            },
            {
                createdAt: 'asc',
            },
            {
                id: 'asc'
            }
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
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    createdAt: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getTopPosts = async (userId: number) => {
    let day = 30;

    // Infer the type of newPosts and assign it to posts
    type PostWithRelations = Prisma.PostGetPayload<{
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                            followerId: number,
                        },
                        select: {
                            followerId: true
                        }
                    },
                    following: {
                        where: {
                            followeeId: number,
                        },
                        select: {
                            followeeId: true
                        }
                    },
                    blockedBy: {
                        where: {
                            blockerId: number,
                        },
                        select: {
                            blockerId: true,
                        }
                    },
                    blockedUsers: {
                        where: {
                            blockedId: number,
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
            },
            reposts: {
                where: {
                    userId: number
                },
                select: {
                    userId: true,
                },
            },
            likes: {
                where: {
                    userId: number
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: number
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        }
    }>;
    let posts: PostWithRelations[] = [];

    do {
        let date = new Date();
        date.setDate(date.getDate() - day);

        const newPosts = await prisma.post.findMany({
            where: {
                AND: [
                    {
                        isDeleted: false
                    },
                    {
                        author: {
                            blockedUsers: {
                                none: {
                                    blockedId: userId,
                                },
                            },
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        },
                    },
                    {
                        replyTo: null,
                    },
                    {
                        createdAt: {
                            gte: date,
                        },
                    },
                ],
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
                {
                    id: 'desc'
                }
            ],
            take: 30 - posts.length,
            select: {
                id: true,
                content: true,
                images: true,
                createdAt: true,
                updatedAt: true,
                isDeleted: true,
                pinnedOnProfile: {
                    select: {
                        pinnedPostId: true,
                    }
                },
                author: {
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
                },
                reposts: {
                    where: {
                        userId: userId
                    },
                    select: {
                        userId: true,
                    },
                },
                likes: {
                    where: {
                        userId: userId
                    },
                    select: {
                        userId: true,
                    },
                },
                bookmarks: {
                    where: {
                        userId: userId
                    },
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                        reposts: true,
                        likes: true,
                    },
                },
            }
        });

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
            },
        },
        select: {
            name: true,
            _count: {
                select: {
                    posts: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------
// ---------- PROFILE INFO ----------------
//                  |
//                  V

export const getPinnedPost = async (
    userId: number,
    username: string,
) => {
    return await prisma.post.findMany({
        where: {
            pinnedOnProfile: {
                user: {
                    username
                }
            }
        },
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    createdAt: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getPosts = async (
    userId: number,
    username: string,
    cursor?: number
) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    isDeleted: false
                },
                {
                    author: {
                        username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
                {
                    replyToId: null,
                },
                {
                    // skip user's posts which were reposted to avoid duplication
                    reposts: {
                        none: {
                            user: {
                                username: username,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    createdAt: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestPost = async (username: string, userId: number) => {
    return await prisma.post.findFirst({
        where: {
            AND: [
                {
                    isDeleted: false
                },
                {
                    author: {
                        username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
                {
                    replyToId: null,
                },
                {
                    reposts: {
                        none: {
                            user: {
                                username: username,
                            },
                        },
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                id: 'asc',
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getReposts = async (
    userId: number,
    username: string,
    cursor?: number
) => {
    return await prisma.post.findMany({
        where: {
            isDeleted: false,
            author: {
                blockedUsers: {
                    none: {
                        blockedId: userId,
                    },
                },
            },
            reposts: {
                some: {
                    user: {
                        username: username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
            },
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
            },
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    isDeleted: true,
                    pinnedOnProfile: {
                        select: {
                            pinnedPostId: true,
                        }
                    },
                    author: {
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
                    },
                    reposts: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    bookmarks: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        },
                    },
                }
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestRepost = async (username: string, userId: number) => {
    return await prisma.post.findFirst({
        where: {
            isDeleted: false,
            author: {
                blockedUsers: {
                    none: {
                        blockedId: userId,
                    },
                },
            },
            reposts: {
                some: {
                    user: {
                        username: username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
            },
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                id: 'asc',
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getReplies = async (
    userId: number,
    username: string,
    cursor?: number
) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    isDeleted: false,
                    author: {
                        username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
                {
                    AND: [
                        {
                            replyToId: {
                                not: null,
                            },
                        },
                        {
                            replyTo: {
                                author: {
                                    blockedUsers: {
                                        none: {
                                            blockedId: userId,
                                        },
                                    },
                                    blockedBy: {
                                        none: {
                                            blockerId: userId,
                                        },
                                    },
                                },
                            }
                        }
                    ]
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
            },
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    isDeleted: true,
                    pinnedOnProfile: {
                        select: {
                            pinnedPostId: true,
                        }
                    },
                    author: {
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
                    },
                    reposts: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    bookmarks: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        },
                    },
                }
            },
            reposts: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            likes: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestReply = async (username: string, userId: number) => {
    return await prisma.post.findFirst({
        where: {
            AND: [
                {
                    isDeleted: false,
                    author: {
                        username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
                {
                    replyToId: {
                        not: null,
                    },
                    replyTo: {
                        author: {
                            blockedUsers: {
                                none: {
                                    blockedId: userId,
                                },
                            },
                            blockedBy: {
                                none: {
                                    blockerId: userId,
                                },
                            },
                        },
                    }
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                id: 'asc',
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getMedia = async (
    userId: number,
    username: string,
    cursor?: number
) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    isDeleted: false,
                    author: {
                        username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
                {
                    images: {
                        isEmpty: false,
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                id: 'desc',
            }
        ],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: 10,
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            pinnedOnProfile: {
                select: {
                    pinnedPostId: true,
                }
            },
            author: {
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
            },
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    isDeleted: true,
                    pinnedOnProfile: {
                        select: {
                            pinnedPostId: true,
                        }
                    },
                    author: {
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
                    },
                    reposts: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    bookmarks: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        },
                    },
                }
            },
            reposts: {
                where: {
                    user: {
                        username,
                    },
                },
                select: {
                    userId: true,
                },
            },
            likes: {
                where: {
                    user: {
                        username,
                    },
                },
                select: {
                    userId: true,
                },
            },
            bookmarks: {
                where: {
                    user: {
                        username,
                    },
                },
                select: {
                    userId: true,
                },
            },
            _count: {
                select: {
                    replies: true,
                    reposts: true,
                    likes: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestMedia = async (username: string, userId: number) => {
    return await prisma.post.findFirst({
        where: {
            AND: [
                {
                    isDeleted: false,
                    author: {
                        username,
                        blockedUsers: {
                            none: {
                                blockedId: userId,
                            },
                        },
                    },
                },
                {
                    images: {
                        isEmpty: false,
                    },
                },
            ],
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                id: 'asc',
            }
        ],
        select: {
            id: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getLikes = async (
    userId: number,
    cursor?: number
) => {
    return await prisma.postLike.findMany({
        where: {
            userId: userId,
            post: {
                isDeleted: false,
                author: {
                    blockedUsers: {
                        none: {
                            blockedId: userId,
                        },
                    },
                    blockedBy: {
                        none: {
                            blockerId: userId,
                        },
                    },
                },
            }
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                postId: 'desc',
            },
            {
                userId: 'desc'
            }
        ],
        cursor: cursor
            ? { postLikeId: { postId: cursor, userId: userId } }
            : undefined,
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
                    isDeleted: true,
                    pinnedOnProfile: {
                        select: {
                            pinnedPostId: true,
                        }
                    },
                    author: {
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
                    },
                    replyTo: {
                        select: {
                            id: true,
                            content: true,
                            images: true,
                            createdAt: true,
                            updatedAt: true,
                            isDeleted: true,
                            pinnedOnProfile: {
                                select: {
                                    pinnedPostId: true,
                                }
                            },
                            author: {
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
                            },
                            reposts: {
                                where: {
                                    userId: userId
                                },
                                select: {
                                    userId: true,
                                },
                            },
                            likes: {
                                where: {
                                    userId: userId
                                },
                                select: {
                                    userId: true,
                                },
                            },
                            bookmarks: {
                                where: {
                                    userId: userId
                                },
                                select: {
                                    userId: true,
                                },
                            },
                            _count: {
                                select: {
                                    replies: true,
                                    reposts: true,
                                    likes: true,
                                },
                            },
                        }
                    },
                    reposts: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    bookmarks: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        },
                    },
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestLike = async (userId: number,) => {
    return await prisma.postLike.findFirst({
        where: {
            userId: userId,
            post: {
                isDeleted: false,
                author: {
                    blockedUsers: {
                        none: {
                            blockedId: userId,
                        },
                    },
                    blockedBy: {
                        none: {
                            blockerId: userId,
                        },
                    },
                },
            }
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                postId: 'asc',
            },
            {
                userId: 'asc',
            }
        ],
        select: {
            post: {
                select: {
                    id: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getBookmarks = async (
    userId: number,
    cursor?: number
) => {
    return await prisma.postBookmark.findMany({
        where: {
            userId: userId,
            post: {
                isDeleted: false,
                author: {
                    blockedUsers: {
                        none: {
                            blockedId: userId,
                        },
                    },
                    blockedBy: {
                        none: {
                            blockerId: userId,
                        },
                    },
                },
            }
        },
        orderBy: [
            {
                createdAt: 'desc'
            },
            {
                postId: 'desc',
            },
            {
                userId: 'desc'
            }
        ],
        cursor: cursor
            ? { postBookmarkId: { postId: cursor, userId: userId } }
            : undefined,
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
                    isDeleted: true,
                    pinnedOnProfile: {
                        select: {
                            pinnedPostId: true,
                        }
                    },
                    author: {
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
                    },
                    replyTo: {
                        select: {
                            id: true,
                            content: true,
                            images: true,
                            createdAt: true,
                            updatedAt: true,
                            isDeleted: true,
                            pinnedOnProfile: {
                                select: {
                                    pinnedPostId: true,
                                }
                            },
                            author: {
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
                            },
                            reposts: {
                                where: {
                                    userId: userId
                                },
                                select: {
                                    userId: true,
                                },
                            },
                            likes: {
                                where: {
                                    userId: userId
                                },
                                select: {
                                    userId: true,
                                },
                            },
                            bookmarks: {
                                where: {
                                    userId: userId
                                },
                                select: {
                                    userId: true,
                                },
                            },
                            _count: {
                                select: {
                                    replies: true,
                                    reposts: true,
                                    likes: true,
                                },
                            },
                        }
                    },
                    reposts: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    bookmarks: {
                        where: {
                            userId: userId
                        },
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            reposts: true,
                            likes: true,
                        },
                    },
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestBookmark = async (userId: number) => {
    return await prisma.postBookmark.findFirst({
        where: {
            userId: userId,
            post: {
                isDeleted: false,
                author: {
                    blockedUsers: {
                        none: {
                            blockedId: userId,
                        },
                    },
                    blockedBy: {
                        none: {
                            blockerId: userId,
                        },
                    },
                },
            }
        },
        orderBy: [
            {
                createdAt: 'asc'
            },
            {
                postId: 'asc',
            },
            {
                userId: 'asc'
            }
        ],
        select: {
            post: {
                select: {
                    id: true,
                },
            },
        },
    });
};

// ---------------------------------------------------------------------------------------------------------
// ---------- SETTER FUNCTIONS ----------------
//                    |
//                    V

// ---------------------------------------------------------------------------------------------------------

export const postExists = async (id: number) => {
    return await prisma.post.findUnique({
        where: {
            id,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const handlePostHashtags = async (
    postId: number,
    hashtags: string[]
) => {
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

export const createPost = async (userId: number, postData: NewPostType) => {
    try {
        return await prisma.post.create({
            data: {
                content: postData.text,
                images: postData.images,
                replyToId: postData.replyToId,
                authorId: userId,
            },
            select: {
                id: true,
                content: true,
                images: true,
                createdAt: true,
                updatedAt: true,
                isDeleted: true,
                pinnedOnProfile: {
                    select: {
                        pinnedPostId: true,
                    }
                },
                author: {
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
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        images: true,
                        createdAt: true,
                        updatedAt: true,
                        isDeleted: true,
                        pinnedOnProfile: {
                            select: {
                                pinnedPostId: true,
                            }
                        },
                        author: {
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
                        },
                        reposts: {
                            where: {
                                userId: userId
                            },
                            select: {
                                userId: true,
                            },
                        },
                        likes: {
                            where: {
                                userId: userId
                            },
                            select: {
                                userId: true,
                            },
                        },
                        bookmarks: {
                            where: {
                                userId: userId
                            },
                            select: {
                                userId: true,
                            },
                        },
                        _count: {
                            select: {
                                replies: true,
                                reposts: true,
                                likes: true,
                            },
                        },
                    }
                },
                reposts: {
                    where: {
                        userId: userId
                    },
                    select: {
                        userId: true,
                    },
                },
                likes: {
                    where: {
                        userId: userId
                    },
                    select: {
                        userId: true,
                    },
                },
                bookmarks: {
                    where: {
                        userId: userId
                    },
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                        reposts: true,
                        likes: true,
                    },
                },
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2000') throw new AppError("Post content can't exceed 280 characters and/or 4 images ", 400, 'CONSTRAINT_FAILED');
        }

        if (error instanceof AppError) throw error;

        throw new AppError('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
};

// ---------------------------------------------------------------------------------------------------------

export const deletePost = async (postId: number) => {
    return await prisma.$transaction([
        prisma.profile.updateMany({
            where: {
                pinnedPostId: postId,
            },
            data: {
                pinnedPostId: null
            }
        }),

        // Mark the post as deleted
        prisma.post.update({
            where: {
                id: postId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                content: null,
                images: [],
            }
        })
    ]);
};

// ---------------------------------------------------------------------------------------------------------

export const addPostRepost = async (userId: number, postId: number) => {
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                isDeleted: false,
            },
            select: {
                id: true,
                authorId: true
            }
        });
        if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND');

        const isAuthorBlocked = await prisma.block.findUnique({
            where: {
                blockId: { blockerId: userId, blockedId: post.authorId }
            },
            select: {
                createdAt: true,
            }
        });
        if (isAuthorBlocked !== null) throw new AppError('Author is blocked', 404, 'USER_BLOCKED');

        return await prisma.postRepost.create({
            data: {
                postId,
                userId,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Unique constraint violation (e.g. username or email already exists)
                return {
                    error: 'Unique constraint violation',
                    fields: (error.meta?.target as string[]) ?? [],
                };
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
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const addPostLike = async (userId: number, postId: number) => {
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                isDeleted: false,
            }
        });
        if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND');

        const isAuthorBlocked = await prisma.block.findUnique({
            where: {
                blockId: { blockerId: userId, blockedId: post.authorId }
            },
            select: {
                createdAt: true,
            }
        });
        if (isAuthorBlocked !== null) throw new AppError('Author is blocked', 404, 'USER_BLOCKED');

        return await prisma.postLike.create({
            data: {
                postId,
                userId,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return {
                    error: 'Unique constraint violation',
                    fields: (error.meta?.target as string[]) ?? [],
                };
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
    });
};

// ---------------------------------------------------------------------------------------------------------

export const addPostBookmark = async (userId: number, postId: number) => {
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                isDeleted: false,
            }
        });
        if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND');

        const isAuthorBlocked = await prisma.block.findUnique({
            where: {
                blockId: { blockerId: userId, blockedId: post.authorId }
            },
            select: {
                createdAt: true,
            }
        });
        if (isAuthorBlocked !== null) throw new AppError('Author is blocked', 404, 'USER_BLOCKED');

        return await prisma.postBookmark.create({
            data: {
                postId,
                userId,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return {
                    error: 'Unique constraint violation',
                    fields: (error.meta?.target as string[]) ?? [],
                };
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
    });
};

// ---------------------------------------------------------------------------------------------------------

export const addPostPin = async (userId: number, postId: number) => {
    const post = prisma.post.findUnique({
        where: {
            id: postId,
            isDeleted: false,
        }
    });
    if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND');

    return await prisma.profile.update({
        where: {
            userId
        },
        data: {
            pinnedPostId: postId,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removePostPin = async (userId: number) => {
    return await prisma.profile.update({
        where: {
            userId
        },
        data: {
            pinnedPostId: null,
        }
    });
};