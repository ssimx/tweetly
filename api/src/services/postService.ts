import { Post, Prisma, PrismaClient, Profile, User } from '@prisma/client';
import { UserProps } from '../lib/types';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const postExists = async (id: number) => {
    return await prisma.post.findUnique({
        where: { id },
    })
};

// ---------------------------------------------------------------------------------------------------------

interface NewPostDataProps {
    text: string,
    replyToId?: number,
    user: UserProps,
}

type NewPostResponse =
    | { post: Post }
    | { error: string; fields?: string[] };

export const createPost = async (postData: NewPostDataProps): Promise<NewPostResponse> => {
    try {
        const post = await prisma.post.create({
            data: {
                content: postData.text,
                authorId: postData.user.id,
                replyToId: postData.replyToId,
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

export const getPostInfo = async (userId: number, postId: number) => {
    return await prisma.post.findUnique({
        where: { id: postId },
        select: {
            id: true,
            content: true,
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
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getPosts = async (userId: number, username: string) => {
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

export const getReposts = async (userId: number, username: string) => {
    return await prisma.post.findMany({
        where: {
            AND: [
                {
                    reposts: {
                        some: {
                            user: {
                                username: username
                            }
                        }
                    }
                },
            ]

        },
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

export const getReplies = async (userId: number, username: string) => {
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

export const getLikedPosts = async (userId: number, username: string) => {
    return await prisma.postLike.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'desc'
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

export const getGlobal30DayPosts = async (userId: number) => {
    let date = new Date();
    date.setDate(date.getDate() - 30);

    return await prisma.post.findMany({
        where: {
            createdAt: {
                gte: date
            },
            replyToId: null
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            content: true,
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
        },
    })
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

// ---------------------------------------------------------------------------------------------------------

export const getPostReplies = async (userId: number, postId: number) => {
    return await prisma.post.findMany({
        where: {
            replyToId: postId,
        },
        select: {
            id: true,
            content: true,
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