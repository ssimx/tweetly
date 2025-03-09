// Helper fnction to remap user information (profile user / post author / follow suggestion...)

import { BasePostDataType, NotificationType, UserDataType, VisitedPostDataType } from 'tweetly-shared'

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
            author: remapUserInformation(post.replyTo.author),

            stats: {
                likesCount: post.replyTo._count.likes,
                repostsCount: post.replyTo._count.reposts,
                repliesCount: post.replyTo._count.replies,
            },

            relationship: {
                viewerHasLiked: post.replyTo.likes.length ? true : false,
                viewerHasReposted: post.replyTo.reposts.length ? true : false,
                viewerHasBookmarked: post.replyTo.bookmarks.length ? true : false,
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

export type RawNotificationDataType = {
    id: number,
    type: {
        name: 'POST' | 'REPOST' | 'LIKE' | 'REPLY' | 'FOLLOW',
        description: string,
    },
    notifier: RawUserDataType,
    post?: Omit<RawPostDataType, 'replyTo'> & {
        // post relationship/stats are not present in nested (replied to) post
        replyTo?: Omit<RawPostDataType, 'reposts' | 'likes' | 'bookmarks' | '_count'>,
    },
    isRead: boolean,
};

export function remapNotificationInformation(notification: RawNotificationDataType) {
    if (!['POST', 'REPOST', 'LIKE', 'REPLY', 'FOLLOW'].includes(notification.type.name)) return;

    return {
        id: notification.id,
        type: {
            name: notification.type.name,
            description: notification.type.description,
        },

        notifier: remapUserInformation(notification.notifier),

        post: notification.post ? {
            id: notification.post.id,
            content: notification.post.content,
            images: notification.post.images,
            createdAt: notification.post.createdAt,
            updatedAt: notification.post.updatedAt,
            author: remapUserInformation(notification.post.author),

            replyTo: notification.post.replyTo ? {
                id: notification.post.replyTo.id,
                content: notification.post.replyTo.content,
                images: notification.post.replyTo.images,
                createdAt: notification.post.replyTo.createdAt,
                updatedAt: notification.post.replyTo.updatedAt,
                author: remapUserInformation(notification.post.replyTo.author),
            } : undefined,

            stats: {
                likesCount: notification.post._count.likes,
                repostsCount: notification.post._count.reposts,
                repliesCount: notification.post._count.replies,
            },

            relationship: {
                viewerHasLiked: notification.post.likes.length ? true : false,
                viewerHasReposted: notification.post.reposts.length ? true : false,
                viewerHasBookmarked: notification.post.bookmarks.length ? true : false,
            }
        } : undefined,

        isRead: notification.isRead,
    } as NotificationType;
};