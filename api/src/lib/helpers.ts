// Helper fnction to remap user information (profile user / post author / follow suggestion...)

import { BasePostDataType, UserDataType, VisitedPostDataType } from 'tweetly-shared'

type RawUserDataType = {
    username: string,

    profile: {
        name: string,
        bio: string,
        location: string,
        websiteUrl: string,
        bannerPicture: string,
        profilePicture: string,
    } | null,

    followers: {
        followerId: number,
    }[] | [],

    following: {
        followeeId: number,
    }[] | [],

    blockedBy: {
        blockerId: number,
    }[] | [],

    blockedUsers: {
        blockedId: number,
    }[] | [],

    _count: {
        followers: number,
        following: number,
    },
};

type RawProfileDataType = Omit<RawUserDataType, '_count'> & {
    createdAt: Date,

    _count: {
        followers: number,
        following: number,
        posts: number,
    },

    notifying: {
        receiverId: number,
    }[] | [],

    conversationsParticipant: {
        conversation: {
            id: string,
        }
    }[] | [],
};

export function remapUserInformation(user: RawUserDataType) {
    return {
        username: user.username,

        profile: {
            name: user.profile!.name,
            bio: user.profile!.bio,
            location: user.profile!.location,
            websiteUrl: user.profile!.websiteUrl,
            bannerPicture: user.profile!.bannerPicture,
            profilePicture: user.profile!.profilePicture,
        },

        stats: {
            followersCount: user._count.followers,
            followingCount: user._count.following,
        },

        relationship: {
            isFollowingViewer: user.following.length ? true : false,
            hasBlockedViewer: user.blockedUsers.length ? true : false,

            isFollowedByViewer: user.followers.length ? true : false,
            isBlockedByViewer: user.blockedBy.length ? true : false,
        },
    } as UserDataType;
};

export function remapUserProfileInformation(user: RawProfileDataType) {
    return {
        username: user.username,
        createdAt: user.createdAt,

        profile: {
            name: user.profile!.name,
            bio: user.profile!.bio,
            location: user.profile!.location,
            websiteUrl: user.profile!.websiteUrl,
            bannerPicture: user.profile!.bannerPicture,
            profilePicture: user.profile!.profilePicture,
        },

        stats: {
            followersCount: user._count.followers,
            followingCount: user._count.following,
            postsCount: user._count.posts,
        },

        relationship: {
            isFollowingViewer: user.following.length ? true : false,
            hasBlockedViewer: user.blockedUsers.length ? true : false,

            isFollowedByViewer: user.followers.length ? true : false,
            isBlockedByViewer: user.blockedBy.length ? true : false,

            notificationsEnabled: user.notifying.length ? true : false,
        },

        messaging: {
            conversationId: user.conversationsParticipant.length
                ? user.conversationsParticipant[0].conversation.id
                : null
        }
    } as UserDataType
};

type RawPostDataType = {
    id: number,
    content?: string | null | undefined,
    images: string[],
    createdAt: Date,
    updatedAt: Date,
    author: RawUserDataType,

    replyTo?: Omit<RawPostDataType, 'replyTo'> | null | undefined,

    reposts: {
        userId?: number,
        createdAt?: Date,
    }[],

    likes: {
        userId?: number,
        createdAt?: Date,
    }[],

    bookmarks: {
        userId?: number,
        createdAt?: Date,
    }[],

    _count: {
        likes: number,
        reposts: number,
        replies: number,
    }
};

export function remapPostInformation(post: RawPostDataType) {
    return {
        id: post.id,
        content: post.content ?? undefined,
        images: post.images,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: remapUserInformation(post.author),

        replyTo: post.replyTo ? {
            id: post.replyTo.id,
            content: post.replyTo.content,
            images: post.replyTo.images,
            createdAt: post.replyTo.createdAt,
            updatedAt: post.replyTo.updatedAt,
            author: remapUserInformation(post.replyTo.author),

            stats: {
                likesCount: post._count.likes,
                repostsCount: post._count.reposts,
                repliesCount: post._count.replies,
            },

            relationship: {
                viewerHasLiked: post.likes.length ? true : false,
                viewerHasReposted: post.reposts.length ? true : false,
                viewerHasBookmarked: post.bookmarks.length ? true : false,
            }
        } : undefined,

        stats: {
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            repliesCount: post._count.replies,
        },

        relationship: {
            viewerHasLiked: post.likes.length ? true : false,
            viewerHasReposted: post.reposts.length ? true : false,
            viewerHasBookmarked: post.bookmarks.length ? true : false,
        }
    } as BasePostDataType;
};

type RawVisitedPostDataType = {
    id: number,
    content?: string | null | undefined,
    images: string[],
    createdAt: Date,
    updatedAt: Date,
    author: RawUserDataType,

    // If it's a reply, it has replyTo parent information which itself doesn't have replyTo information
    replyTo?: Omit<RawPostDataType, 'replyTo'> | null | undefined,

    // Post can have replies which themselves don't have replyTo information
    replies?: Omit<RawPostDataType[], 'replyTo'> | null | undefined,

    reposts: {
        userId?: number,
        createdAt?: Date,
    }[],

    likes: {
        userId?: number,
        createdAt?: Date,
    }[],

    bookmarks: {
        userId?: number,
        createdAt?: Date,
    }[],

    _count: {
        likes: number,
        reposts: number,
        replies: number,
    }
};

export function remapVisitedPostInformation(post: RawVisitedPostDataType) {
    return {
        id: post.id,
        content: post.content ?? undefined,
        images: post.images,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: remapUserInformation(post.author),

        replyTo: post.replyTo ? {
            id: post.replyTo.id,
            content: post.replyTo.content,
            images: post.replyTo.images,
            createdAt: post.replyTo.createdAt,
            updatedAt: post.replyTo.updatedAt,
            author: remapUserInformation(post.author),

            stats: {
                likesCount: post._count.likes,
                repostsCount: post._count.reposts,
                repliesCount: post._count.replies,
            },

            relationship: {
                viewerHasLiked: post.likes.length ? true : false,
                viewerHasReposted: post.reposts.length ? true : false,
                viewerHasBookmarked: post.bookmarks.length ? true : false,
            }
        } : undefined,

        replies: {
            posts: post.replies
                ? post.replies.map((reply) => {
                    // skip if there's no information
                    if (!reply) return;
                    if (!reply.author) return;
                    if (!reply.author.profile) return;

                    return remapPostInformation({ ...reply, content: reply.content ?? undefined });
                }).filter((reply): reply is NonNullable<typeof reply> => reply !== undefined)
                : undefined,
            end: true, // by default
        },

        stats: {
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            repliesCount: post._count.replies,
        },

        relationship: {
            viewerHasLiked: post.likes.length ? true : false,
            viewerHasReposted: post.reposts.length ? true : false,
            viewerHasBookmarked: post.bookmarks.length ? true : false,
        }
    } as VisitedPostDataType;
};