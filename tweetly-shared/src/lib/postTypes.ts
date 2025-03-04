import { z } from 'zod';
import { newPostDataSchema } from '../schemas/postSchemas';
import { UserDataType } from './userTypes';

// Type for new post data
export type NewPostDataType = z.infer<typeof newPostDataSchema>;

// Type for relationship between post and logged in user
export type PostAndViewerRelationshipDataType = {
    // 'Viewer' === logged in user
    viewerHasLiked: boolean,
    likedAt?: Date,
    viewerHasReposted: boolean,
    repostedAt?: Date,
    viewerHasBookmarked: boolean,
    bookmarkedAt?: Date,
};

export type BasePostDataType = {
    // Basic profile information
    id: number,
    content?: string,
    images: string[],
    createdAt: Date,
    updatedAt: Date,
    author: UserDataType,

    // Optional replyTo property which has parent post information if the original post is reply
    replyTo?: Omit<BasePostDataType, 'replyTo'>,

    // Statistics
    stats: {
        likesCount: number,
        repostsCount: number,
        repliesCount: number,
    },

    // Relationship with logged-in user
    relationship: PostAndViewerRelationshipDataType,
};

// The posts tab on the profile is a collection of posts and reposts from users combined
export type ProfilePostOrRepostDataType = BasePostDataType & {
    type: 'POST' | 'REPOST',
    timeForSorting: number,
};

export type VisitedPostDataType = BasePostDataType & {
    replies: {
        posts: BasePostDataType[],
        cursor: number | null,
        end: boolean,
    },
};