'use server';

import { getCurrentUserToken, verifyCurrentUserSettingsToken } from '@/data-acess-layer/auth';
import { getBookmarks, getConversation, getConversationNewerMessages, getConversationOlderMessages, getConversations, getNotifications, getProfileLikedPosts, patchProfile } from '@/data-acess-layer/user-dto';
import { createSettingsSession, updateSessionToken } from '@/lib/session';
import { fetchWithSessionToken } from '@/lib/utils';
import { revalidateTag } from 'next/cache';
import { UserUpdateProfileType, ApiResponse, LoggedInUserDataType, userUpdateProfileSchema, ErrorResponse, AppError, SuccessResponse, isZodError, FormUserSettingsAccessType, UserUpdateUsernameType, userSettingsAccessSchema, userUpdateUsernameSchema, UserUpdateBirthdayType, UserUpdateEmailType, UserUpdatePasswordType, userUpdateBirthdaySchema, userUpdateEmailSchema, userUpdatePasswordSchema, NotificationType, BasePostDataType, ConversationCardType, ConversationType, ConversationMessageType, UserDataType } from 'tweetly-shared';

// ---------------------------------------------------------------------------------------------------------
// ------------------------------------------ USER PERSONAL DATA -------------------------------------------
// ---------------------------------------------------------------------------------------------------------

export async function getUserNotifications(cursor?: number): Promise<ApiResponse<{ notifications: NotificationType[], cursor: number | null, end: boolean }>> {
    return await getNotifications(cursor);
};

export async function getUserBookmarks(cursor?: number): Promise<ApiResponse<{ bookmarks: BasePostDataType[], cursor: number | null, end: boolean }>> {
    return await getBookmarks(cursor);
};

export async function getUserConversations(cursor?: number): Promise<ApiResponse<{ conversations: ConversationCardType[], cursor: string | null, end: boolean }>> {
    return await getConversations(cursor);
};

export async function getUserConversation(id: string): Promise<ApiResponse<{ conversation: ConversationType }>> {
    return await getConversation(id);
};

export async function getUserConversationOlderMessages(id: string, cursor: string): Promise<ApiResponse<{ messages: ConversationMessageType[], cursor: string | null, end: boolean }>> {
    return await getConversationOlderMessages(id, cursor);
};

export async function getUserConversationNewerMessages(id: string, cursor: string): Promise<ApiResponse<{ messages: ConversationMessageType[], cursor: string | null, end: boolean }>> {
    return await getConversationNewerMessages(id, cursor);
};

export async function getUserProfileLikes(cursor?: number): Promise<ApiResponse<{ likes: BasePostDataType[], cursor: number | null, end: boolean }>> {
    return await getProfileLikedPosts(cursor);
};

// ---------------------------------------------------------------------------------------------------------
// ------------------------------------------- USER PROFILE -----------------------------------------------
// ---------------------------------------------------------------------------------------------------------

export async function getUserProfile(username: string): Promise<ApiResponse<{ user: UserDataType, authorized: boolean }>> {
    const url = `http://localhost:3000/api/users/${username}`;
    const response = await fetchWithSessionToken<{ user: UserDataType, authorized: boolean }>(url);

    if (response.success) {
        const { user, authorized } = response.data;
        return {
            success: true,
            data: { user, authorized: authorized ?? false },
        };
    }

    return response;
};


// ---------------------------------------------------------------------------------------------------------
// ------------------------------------------- USER SETTINGS -----------------------------------------------
// ---------------------------------------------------------------------------------------------------------

export async function patchUserProfile(formData: UserUpdateProfileType): Promise<ApiResponse<{ profile: Pick<LoggedInUserDataType, 'profile'>['profile'] }>> {
    revalidateTag('loggedInUser');

    return await patchProfile(formData);
};

export async function verifyLoginPasswordForSettings(formData: FormUserSettingsAccessType): Promise<ApiResponse<undefined>> {
    try {
        const sessionToken = await getCurrentUserToken();

        const alreadyValidSettingsToken = await verifyCurrentUserSettingsToken();
        if (alreadyValidSettingsToken) {
            throw new Error('User already has valid token');
        }

        const validatedData = userSettingsAccessSchema.parse(formData);

        const response = await fetch('http://localhost:3000/api/auth/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ token: string }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.token === undefined) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

        await createSettingsSession(data.token);

        return {
            success: true,
            data: undefined
        }
    } catch (error: unknown) {
        // Handle validation errors
        if (isZodError(error)) {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_FAILED',
                    details: error.issues,
                }
            } as ErrorResponse;
        } else if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function changeUsername(formData: UserUpdateUsernameType): Promise<ApiResponse<undefined>> {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            throw new AppError('Invalid settings token', 401, 'UNAUTHORIZED');
        }

        const validatedData = userUpdateUsernameSchema.parse(formData);

        const response = await fetch(`http://localhost:3000/api/users/username`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                'Settings-Token': `Bearer ${settingsToken}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ accessToken: string, settingsToken: string }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.accessToken === undefined) throw new AppError('Session JWT is missing in data response', 404, 'MISSING_JWT');
        else if (data.settingsToken === undefined) throw new AppError('Settings JWT is missing in data response', 404, 'MISSING_JWT');

        await updateSessionToken(data.accessToken);
        await createSettingsSession(data.settingsToken);
        revalidateTag("loggedInUser");

        return {
            success: true,
        }
    } catch (error: unknown) {
        // Handle validation errors
        if (isZodError(error)) {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_FAILED',
                    details: error.issues,
                }
            } as ErrorResponse;
        } else if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function changeEmail(formData: UserUpdateEmailType): Promise<ApiResponse<undefined>> {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            throw new Error('Invalid settings token');
        }

        const validatedData = userUpdateEmailSchema.parse(formData);

        const response = await fetch(`http://localhost:3000/api/users/email`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                'Settings-Token': `Bearer ${settingsToken}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ accessToken: string, settingsToken: string }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.accessToken === undefined) throw new AppError('Session JWT is missing in data response', 404, 'MISSING_JWT');
        else if (data.settingsToken === undefined) throw new AppError('Settings JWT is missing in data response', 404, 'MISSING_JWT');

        await updateSessionToken(data.accessToken);
        await createSettingsSession(data.settingsToken);
        revalidateTag("loggedInUser");

        return {
            success: true,
        }
    } catch (error: unknown) {
        // Handle validation errors
        if (isZodError(error)) {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_FAILED',
                    details: error.issues,
                }
            } as ErrorResponse;
        } else if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function changeBirthday(formData: UserUpdateBirthdayType): Promise<ApiResponse<undefined>> {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            throw new Error('Invalid settings token');
        }

        const validatedData = userUpdateBirthdaySchema.parse(formData);

        const response = await fetch(`http://localhost:3000/api/users/birthday`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                'Settings-Token': `Bearer ${settingsToken}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        await response.json() as SuccessResponse<undefined>;
        revalidateTag("loggedInUser");

        return {
            success: true,
        }
    } catch (error: unknown) {
        // Handle validation errors
        if (isZodError(error)) {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_FAILED',
                    details: error.issues,
                }
            } as ErrorResponse;
        } else if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function changePassword(formData: UserUpdatePasswordType): Promise<ApiResponse<undefined>> {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            throw new AppError('Invalid settings token', 401, 'UNAUTHORIZED');
        }

        const validatedData = userUpdatePasswordSchema.parse(formData);

        const response = await fetch(`http://localhost:3000/api/users/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                'Settings-Token': `Bearer ${settingsToken}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        await response.json() as SuccessResponse<undefined>;
        revalidateTag("loggedInUser");

        return {
            success: true,
        }
    } catch (error: unknown) {
        // Handle validation errors
        if (isZodError(error)) {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_FAILED',
                    details: error.issues,
                }
            } as ErrorResponse;
        } else if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

// ---------------------------------------------------------------------------------------------------------
// ------------------------------------------ USER INTERACTION ---------------------------------------------
// ---------------------------------------------------------------------------------------------------------

export async function followUser(username: string): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/users/follow/${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        revalidateTag('loggedInUser');

        return {
            success: true,
            data: undefined
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function unfollowUser(username: string): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/users/removeFollow/${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        revalidateTag('loggedInUser');

        return {
            success: true,
            data: undefined
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function blockUser(username: string): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/users/block/${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        revalidateTag('loggedInUser');

        return {
            success: true,
            data: undefined
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function unblockUser(username: string): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/users/removeBlock/${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        revalidateTag('loggedInUser');

        return {
            success: true,
            data: undefined
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function enableNotificationsForUser(username: string): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/users/enableNotifications/${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        return {
            success: true,
            data: undefined
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function disableNotificationsForUser(username: string): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/users/disableNotifications/${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        return {
            success: true,
            data: undefined
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};