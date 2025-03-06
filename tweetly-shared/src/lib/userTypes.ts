// Type for logged in user JWT payload
export type TemporaryUserJwtPayload = {
    type: 'temporary',
    id: number,
    email: string,
};

// Type for logged in user JWT payload
export type LoggedInUserJwtPayload = {
    type: 'user',
    id: number,
    email: string,
    username: string
};

// Type for temporary user information
export type LoggedInTemporaryUserDataType = {
    id: number,
    createdAt: Date,
    updatedAt: Date,
    profileName: string,
    email: string,
    emailVerified: boolean,
    dateOfBirth: Date,
    password: boolean,
    username: boolean,
    profilePicture: boolean,
    registrationComplete: boolean,
};

// Type for logged in user information
export type LoggedInUserDataType = {
    id: number,
    createdAt: Date,
    username: string,
    email: string,
    dateOfBirth: Date,
    following: number,
    followers: number,
    profile: {
        name: string,
        bio: string,
        location: string,
        websiteUrl: string,
        profilePicture: string,
        bannerPicture: string,
    },
};

// Type for relationship between profile/post user and logged in user
export type UserAndViewerRelationshipType = {
    // 'Viewer' === logged in user

    // From user's perspective
    isFollowingViewer: boolean,
    hasBlockedViewer: boolean,

    // From viewer's perspective
    isFollowedByViewer: boolean,
    isBlockedByViewer: boolean,
    notificationsEnabled?: boolean,
};

// Type for stats for profile user/post author
export type UserStatsType = {
    followingCount: number,
    followersCount: number,
    postsCount?: number,
};

// Type for user information, can be profile / post author / follow suggestion...
export type UserDataType = {
    // Basic profile information
    username: string,
    createdAt: Date,

    // Profile details
    profile: {
        name: string,
        bio: string,
        location: string,
        websiteUrl: string,
        bannerPicture: string,
        profilePicture: string,
    },

    // Statistics
    stats: UserStatsType,

    // Relationship with logged-in user
    relationship: UserAndViewerRelationshipType,

    // Messaging
    messaging?: {
        conversationId: string | null;
    };
};