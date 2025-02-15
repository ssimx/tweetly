export interface JwtPayload {
    id: string,
    email: string,
    username: string,
    exp: number,
};

export interface User {
    id: string,
    username: string,
    dateOfBirth: string,
    email: string,
    password: string,
};

export interface Post {
    id: number,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    authorId: number,
    replyToId: number | null,
};

export interface UserInfo {
    id: number,
    username: string;
    email: string;
    dateOfBirth: string;
    createdAt: string,
    profile: {
        name: string;
        bio: string;
        location: string;
        websiteUrl: string;
        profilePicture: string;
        bannerPicture: string;
    },
    _count: {
        following: number,
        followers: number,
    },
};

export interface ProfileInfoType {

};

export interface UserInfoType {
    username: string,
    profile: {
        name: string,
        bio: string,
        profilePicture: string,
    },
    following: {
        followeeId: number,
    }[],
    followers: {
        followerId: number,
    }[],
    blockedBy: {
        blockerId: number,
    }[],
    _count: {
        followers: number,
        following: number,
    },
};

export type UserProfileInfoType = Pick<UserInfo, 'profile'>['profile'];

export interface ProfileInfo {
    username: string,
    createdAt: string,
    profile: {
        name: string,
        bio: string,
        location: string,
        websiteUrl: string,
        bannerPicture: string,
        profilePicture: string,
    },
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
    notifying: {
        receiverId: number,
    }[] | [],
    conversationsParticipant: {
        conversation: {
            id: string,
        }
    }[] | [],
    _count: {
        followers: number,
        following: number,
        posts: number,
    },
};

// ------ POST TYPES -------------------------------------------------------------------------------------------------------------

interface BasePostType {
    id: number,
    content?: string,
    images: string[],
    createdAt: string,
    updatedAt: string,
    author: UserInfoType,
    reposts: {
        userId?: number,
        createdAt?: string,
    }[],
    likes: {
        userId?: number,
        createdAt?: string,
    }[],
    bookmarks: {
        userId?: number,
        createdAt?: string,
    }[],
    _count: {
        likes: number,
        reposts: number,
        replies: number,
    }
};

// general post info, no reply info
export type BasicPostType = BasePostType;

// general post info with optional reply info
export type BasicPostOptionalReplyType = BasePostType & {
    replyTo?: BasicPostType
};

// general post info with reply info
export type BasicPostWithReplyType = BasePostType & {
    replyTo: BasicPostType
};

// when post is visited, fetch post, parent post (if reply) and replies
export type VisitedPostType = BasePostType & {
    replyTo?: BasePostType;
    replies: BasePostType[];
    repliesEnd: boolean,
};

// on profile we fetch non-reply posts and reposts, then they're mapped together and sorted by the time
export type ProfilePostOrRepostType = BasePostType & {
    type: 'POST' | 'REPOST',
    timeForSorting: number,
    replyTo?: BasePostType,
};

// on profile Replies tab fetches only posts by user that were a reply to other post
export type ProfileReplyPostType = BasePostType & {
    replyTo: BasePostType,
};

// freshly created post
export type NewPostType = {
    id: number;
    author: {
        id: number;
        username: string;
    };
};

// -------------------------------------------------------------------------------------------------------------------------------------

// bookmarked post can be either reply or non reply
export type BookmarkedPostType = BasePostType & {
    replyTo?: BasePostType,
};

export interface PostInfoType {
    id: number,
    content?: string,
    images: string[],
    createdAt: string,
    updatedAt: string,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        posts: {
            id: number,
            content: string,
            createdAt: string,
            updatedAt: string,
            authorId: number,
            replyToId: number | null,
        }[],
        repostedPosts: {
            id: number,
            content: string,
            createdAt: string,
            updatedAt: string,
            authorId: number,
            replyToId: number | null,
        }[],
        followers: {
            username: string,
            profile: {
                name: string,
                bio: string,
                profilePicture: string,
            },
            _count: {
                followers: number,
                following: number,
            }
        }[],
        following: {
            username: string,
            profile: {
                name: string,
                bio: string,
                profilePicture: string,
            },
            _count: {
                followers: number,
                following: number,
            },
        }[],
        _count: {
            followers: number,
            following: number,
            posts: number,
        },
    },
    replies: {
        id: number;
    }[],
    reposts: {
        userId: number;
    }[],
    likes: {
        userId: number;
    }[],
    bookmarks: {
        userId: number;
    }[],
};

export interface PostRepostType {
    id: number,
    content?: string,
    images?: string[],
    createdAt: string,
    updatedAt: string,
    repost: boolean,
    timeForSorting: number,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
        createdAt?: string,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

export type ReplyPostType = BasePostType & {
    replyTo: {
        id: number,
        content?: string,
        images?: string[],
        createdAt: string,
        updatedAt: string,
        author: UserInfoType,
        reposts: {
            userId: number,
        }[] | [],
        likes: {
            userId: number,
        }[] | [],
        bookmarks: {
            userId: number,
        }[] | [],
        _count: {
            replies: number,
            reposts: number,
            likes: number,
        },
    },
};

export interface MediaPostType {
    id: number,
    content?: string,
    images: string[],
    createdAt: string,
    updatedAt: string,
    replyTo?: {
        id: number,
        content: true,
        createdAt: string,
        updatedAt: string,
        author: {
            username: string,
            profile: {
                name: string,
                profilePicture: string,
                bio: string,
            },
            followers: {
                followerId: number,
            }[] | [],
            following: {
                followeeId: number,
            }[] | [],
            _count: {
                followers: number,
                following: number,
            }
        },
        reposts: {
            userId: number,
        }[] | [],
        likes: {
            userId: number,
        }[] | [],
        bookmarks: {
            userId: number,
        }[] | [],
        _count: {
            replies: number,
            reposts: number,
            likes: number,
        },
    },
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

export interface LikedPostType {
    id: number,
    content?: string,
    images?: string[],
    createdAt: string,
    updatedAt: string,
    replyTo: {
        author: {
            username: string,
            profile: {
                name: string,
                profilePicture: string,
                bio: string
            },
            followers: {
                followerId: number,
            }[] | [],
            following: {
                followeeId: number,
            }[] | [],
            _count: {
                followers: number,
                following: number,
            }
        }
    } | null,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

export interface NotificationType {
    id: number;
    type: {
        name: 'POST' | 'REPOST' | 'LIKE' | 'REPLY' | 'FOLLOW';
        description: string;
    };
    isRead: boolean,
    notifier: UserInfoType,
    post?: BasicPostType | ReplyPostType,
};

export interface BookmarkPostType {
    id: number,
    content?: string,
    images?: string[],
    createdAt: string,
    updatedAt: string,
    author: UserInfoType,
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

export interface BookmarkReplyType {
    id: number,
    content?: string,
    images?: string[],
    createdAt: string,
    updatedAt: string,
    author: UserInfoType,
    replyTo: ReplyPostType,
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

export interface ConversationsListType {
    conversations: {
        id: string,
        participants: {
            userA: string,
            userB: string,
        },
        updatedAt: string,
        lastMessage: {
            id: string,
            content: string,
            createdAt: string;
            readStatus: boolean,
            sender: {
                username: string;
                profile: {
                    name: string;
                    profilePicture: string;
                } | null;
            };
            receiver: {
                username: string;
                profile: {
                    name: string;
                    profilePicture: string;
                } | null;
            }
        }
    }[],
    end: boolean,
};

export interface ConversationType {
    conversation: {
        id: string,
        participants: {
            user: {
                username: string,
                createdAt: string,
                profile: {
                    profilePicture: string,
                    name: string,
                    bio: string,
                },
                _count: {
                    followers: number,
                }
            }
        }[],
        messages: {
            id: string,
            content: string,
            readStatus: boolean,
            createdAt: string,
            updatedAt: string,
            sender: {
                username: string
            }
        }[] | [],
    },
    end: boolean,
};

export interface TrendingHashtagType {
    name: string;
    _count: {
        posts: number;
    };
};

export type FollowSuggestionType = UserInfoType & {
    isFollowed: boolean,
};

export type SearchInfoType = {
    users: UserInfoType[],
    posts: BasicPostType[],
    queryParams: {
        raw: string,
        segments: string[],
        stringSegments: string[],
        usernames: string[],
        hashtags: string[],
    },
    end: boolean,
};