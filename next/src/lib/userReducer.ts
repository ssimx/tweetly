import { UserStatsType, UserAndViewerRelationshipType } from 'tweetly-shared';

export type UserStateType = {
    relationship: UserAndViewerRelationshipType,
    stats: UserStatsType,
};

export type UserActionType =
    | { type: 'FOLLOW' }
    | { type: 'UNFOLLOW' }
    | { type: 'BLOCK' }
    | { type: 'UNBLOCK' }
    | { type: 'TOGGLE_NOTIFICATIONS' }
    | { type: 'UPDATE_USER', payload: UserStateType };

export function userInfoReducer(state: UserStateType, action: UserActionType): UserStateType {
    switch (action.type) {
        case 'FOLLOW':
            if (!state.relationship.isFollowedByViewer) {
                return {
                    ...state,
                    relationship: { ...state.relationship, isFollowedByViewer: true },
                    stats: { ...state.stats, followersCount: state.stats.followersCount + 1 }
                };
            }
            return { ...state };

        case 'UNFOLLOW':
            if (state.relationship.isFollowedByViewer) {
                return {
                    ...state,
                    relationship: { ...state.relationship, isFollowedByViewer: false },
                    // check if followers count is for some reason at 0 even tho they have a follower
                    // prevent it from being negative number
                    stats: { ...state.stats, followersCount: state.stats.followersCount > 0 ? state.stats.followersCount - 1 : 0 }
                };
            }
            return { ...state };

        case 'BLOCK':
            if (!state.relationship.isBlockedByViewer) {
                return {
                    ...state,
                    relationship: {
                        ...state.relationship,
                        isBlockedByViewer: true,
                        // when user is blocked, auto unfollow and disable notifications
                        isFollowedByViewer: false,
                        notificationsEnabled: false,
                    },
                    stats: {
                        ...state.stats,
                        followersCount:
                            state.relationship.isFollowedByViewer
                                ? state.stats.followersCount > 0
                                    ? state.stats.followersCount - 1
                                    : 0
                                : state.stats.followersCount
                    }
                }
            }
            return { ...state };

        case 'UNBLOCK':
            if (state.relationship.isBlockedByViewer) {
                return {
                    ...state,
                    relationship: {
                        ...state.relationship,
                        isBlockedByViewer: false,
                        isFollowedByViewer: false,
                        notificationsEnabled: false,
                    },
                }
            }
            return { ...state };

        case 'TOGGLE_NOTIFICATIONS':
            return {
                ...state,
                relationship: {
                    ...state.relationship,
                    notificationsEnabled: !state.relationship.notificationsEnabled
                }
            }

        case 'UPDATE_USER':
            return action.payload;

        default:
            return state;
    }
};

