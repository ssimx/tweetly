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
        content?: string,
        images?: string[],
        readStatus: boolean,
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
    id: string;
    content?: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;

    sentBy: string,
    // receiverId: number,
    readStatus: boolean;
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

    cursor: string | null,
    end: boolean,
};