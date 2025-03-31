import { z } from 'zod';
import { newMessageDataSchema } from '../schemas/miscSchemas';
import { BasePostDataType } from './postTypes';
import { UserDataType } from './userTypes';

export type NotificationType = {
    id: number;
    type: {
        name: 'POST' | 'REPOST' | 'LIKE' | 'REPLY' | 'FOLLOW';
        description: string;
    };
    isRead: boolean,
    notifier: UserDataType,
    post?: BasePostDataType,
};

export type ConversationCardType = {
    id: string,
    updatedAt: Date,
    lastMessage: {
        id: number,
        createdAt: Date,
        content?: string,
        images?: string[],
        readAt?: Date,
        sender: {
            username: string,
            profile: {
                name: string,
                profilePicture: string
            }
        },
        receiver: {
            username: string,
            profile: {
                name: string,
                profilePicture: string
            }
        },
    } | null,
};

export type FormNewConversationMessageDataType = z.infer<typeof newMessageDataSchema>;

export type ConversationMessageType = {
    id: string,
    tempId?: string,
    content?: string,
    images?: string[],
    createdAt: Date,
    updatedAt: Date,
    readAt?: Date,

    sentBy: string,
    status: 'sending' | 'sent' | 'failed',
};

export type ConversationType = {
    id: string,

    participants: {
        username: string,
        createdAt: Date,

        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },

        stats: {
            followersCount: number,
        }
    }[],

    messages: ConversationMessageType[];

    topCursor: string | null,
    topReached: boolean,
    bottomCursor: string | null,
    bottomReached: boolean,
};

export type TrendingHashtagType = {
    name: string;
    postsCount: number,
};