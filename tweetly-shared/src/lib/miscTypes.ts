import { BasePostDataType } from './postTypes';
import { UserDataType } from './userTypes';

export interface NotificationType {
    id: number;
    type: {
        name: 'POST' | 'REPOST' | 'LIKE' | 'REPLY' | 'FOLLOW';
        description: string;
    };
    isRead: boolean,
    notifier: UserDataType,
    post?: BasePostDataType,
};