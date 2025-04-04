'use server';
import { getCurrentTemporaryUserToken, getCurrentUserToken, verifyCurrentUserSettingsToken } from "@/data-acess-layer/auth";
import { createSession, createSettingsSession, createTemporarySession, decryptSession, getUserSessionToken, removeTemporarySession, updateSessionToken, verifySession } from '@/lib/session';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    ApiResponse,
    AppError,
    ErrorResponse,
    newPostDataSchema,
    FormNewPostDataType,
    SuccessfulRegisterResponseType,
    SuccessResponse,
    userSettingsAccessSchema,
    FormUserSettingsAccessType,
    userUpdateBirthdaySchema,
    UserUpdateBirthdayType,
    userUpdateEmailSchema,
    UserUpdateEmailType,
    userUpdatePasswordSchema,
    UserUpdatePasswordType,
    userUpdateUsernameSchema,
    UserUpdateUsernameType,
    FormTemporaryUserPasswordType,
    FormTemporaryUserBasicDataType,
    temporaryUserBasicDataSchema,
    temporaryUserPasswordSchema,
    isZodError,
    FormTemporaryUserUsernameType,
    temporaryUserUsernameSchema,
    FormTemporaryUserProfilePictureType,
    temporaryUserProfilePictureSchema,
    logInUserSchema,
    FormLogInUserDataType,
    usernameSchema,
    usernameOrEmailAvailibilitySchema,
    BasePostDataType,
    UserUpdateProfileType,
    LoggedInUserDataType,
    emailSchema,
    userUpdateProfileSchema,
    FormNewConversationMessageDataType,
    ConversationMessageType,
    newMessageDataSchema,
} from 'tweetly-shared';

// ---------------------------------------------------------------------------------------------------------
// AUTH

// -> registration
// First step of the registration process, registers new temporary user with basic information
export async function registerTemporaryUser(
    basicDataForm: FormTemporaryUserBasicDataType,
    passwordDataForm: FormTemporaryUserPasswordType,
): Promise<ApiResponse<undefined>> {
    try {
        const validatedBasicData = temporaryUserBasicDataSchema.parse(basicDataForm);
        const validatedPassword = temporaryUserPasswordSchema.parse(passwordDataForm);

        const response = await fetch(`http://192.168.1.155:3000/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                basicData: validatedBasicData,
                passwordData: validatedPassword
            }),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<SuccessfulRegisterResponseType>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.token === undefined) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

        await createTemporarySession(data.token);

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

// Second step of the registration process, update temporary user's username
export async function updateTemporaryUserUsername(
    formData: FormTemporaryUserUsernameType
): Promise<ApiResponse<undefined>> {

    const sessionToken = await getUserSessionToken();
    if ((await verifySession(sessionToken)).isAuth) redirect('/');

    try {
        const temporaryToken = await getCurrentTemporaryUserToken();
        if (!temporaryToken) throw new AppError('User not logged in', 400, 'NOT_LOGGED_IN');

        const validatedUsername = temporaryUserUsernameSchema.parse(formData);

        const response = await fetch(`http://192.168.1.155:3000/api/auth/temporary/username`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${temporaryToken}`,
            },
            body: JSON.stringify(validatedUsername),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        return {
            success: true,
            data: undefined,
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

// Third step of the registration process, update temporary user's profile picture
//      remove temp user and create a new user
export async function updateTemporaryUserProfilePicture(
    formData: FormTemporaryUserProfilePictureType
): Promise<ApiResponse<undefined>> {

    const sessionToken = await getUserSessionToken();
    if ((await verifySession(sessionToken)).isAuth) redirect('/');

    try {
        const temporaryToken = await getCurrentTemporaryUserToken();
        if (!temporaryToken) throw new AppError('User not logged in', 400, 'NOT_LOGGED_IN');

        temporaryUserProfilePictureSchema.parse(formData);
        const newFormData = new FormData();

        if (formData.profilePicture) {
            newFormData.append('profilePicture', formData.profilePicture);
        }

        const response = await fetch(`http://192.168.1.155:3000/api/auth/temporary/profilePicture`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${temporaryToken}`,
            },
            body: newFormData,
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ token: string }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.token === undefined) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

        await removeTemporarySession();
        await createSession(data.token);

        return {
            success: true,
            data: undefined,
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

// -> login
export async function loginUser(
    formData: FormLogInUserDataType,
): Promise<ApiResponse<{ type: 'user' | 'temporary' }>> {
    try {
        if (!formData) {
            throw new AppError('Log in data is missing', 404, 'MISSING_DATA');
        }

        const validatedData = logInUserSchema.parse(formData);

        const response = await fetch(`http://192.168.1.155:3000/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

        const payload = await decryptSession(data.token);
        if (!payload) {
            throw new AppError('Payload is missing in JWT', 404, 'MISSING_PAYLOAD');
        } else if (payload.type === 'user') {
            await createSession(data.token);
        } else if (payload.type === 'temporary') {
            await createTemporarySession(data.token);
        } else {
            throw new AppError('Payload is incorrect', 404, 'INCORRECT_PAYLOAD');
        }

        return {
            success: true,
            data: {
                type: payload.type
            }
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
// USER INTERACTION

export async function followUser(username: string): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/users/follow/${username}`, {
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/removeFollow/${username}`, {
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/block/${username}`, {
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/removeBlock/${username}`, {
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/enableNotifications/${username}`, {
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/disableNotifications/${username}`, {
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

export async function createPost(formData: FormNewPostDataType): Promise<ApiResponse<{ post: BasePostDataType }>> {
    try {
        const token = await getCurrentUserToken();
        newPostDataSchema.parse(formData);

        const newFormData = new FormData();

        if (formData.text) {
            newFormData.append('text', String(formData.text));
        }

        if (Array.isArray(formData.images)) {
            formData.images.forEach((file) => {
                newFormData.append(`images`, file);
            });
        } else if (formData.images) {
            newFormData.append('image', formData.images); // Single file case
        }

        if (formData.replyToId) {
            newFormData.append('replyToId', String(formData.replyToId));
        }

        const response = await fetch(`http://192.168.1.155:3000/api/posts/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: newFormData
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ post: BasePostDataType }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!data.post) throw new AppError('Post is missing in data response', 404, 'MISSING_POST');

        return {
            success: true,
            data: {
                post: data.post,
            }
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

export async function removePost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/remove/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
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

export async function repostPost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/repost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function removeRepostPost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/removeRepost/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function likePost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/like/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function removeLikePost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/removeLike/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function bookmarkPost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/bookmark/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function removeBookmarkPost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/removeBookmark/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function pinPost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/pin/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function unpinPost(postId: number): Promise<ApiResponse<undefined>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://192.168.1.155:3000/api/posts/removePin/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

export async function createNewConversationMessage(formData: FormNewConversationMessageDataType, tempId: string): Promise<ApiResponse<{ message: ConversationMessageType }>> {
    try {
        const token = await getCurrentUserToken();

        newMessageDataSchema.parse(formData);

        const newFormData = new FormData();

        if (formData.text) {
            newFormData.append('text', String(formData.text));
        }

        if (Array.isArray(formData.images)) {
            formData.images.forEach((file) => {
                newFormData.append(`images`, file);
            });
        } else if (formData.images) {
            newFormData.append('image', formData.images); // Single file case
        }

        newFormData.append('conversationId', String(formData.conversationId));
        newFormData.append('tempId', String(tempId));

        const response = await fetch(`http://192.168.1.155:3000/api/conversations/messages/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: newFormData
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ message: ConversationMessageType }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!data.message) throw new AppError('Message is missing in data response', 404, 'MISSING_MESSAGE');

        return {
            success: true,
            data: {
                message: data.message,
            }
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

export async function hardRedirect(uri: string) {
    return redirect(uri);
};

// ---------------------------------------------------------------------------------------------------------
//                                             ACCOUNT ACTIONS
// ---------------------------------------------------------------------------------------------------------

export async function verifyLoginPasswordForSettings(formData: FormUserSettingsAccessType): Promise<ApiResponse<undefined>> {
    try {
        const sessionToken = await getCurrentUserToken();

        const alreadyValidSettingsToken = await verifyCurrentUserSettingsToken();
        if (alreadyValidSettingsToken) {
            throw new Error('User already has valid token');
        }

        const validatedData = userSettingsAccessSchema.parse(formData);

        const response = await fetch('http://192.168.1.155:3000/api/auth/settings', {
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

export async function checkIfUsernameIsAvailable(formData: { username: string }): Promise<ApiResponse<{ available: boolean }>> {
    try {
        const validatedData = usernameSchema.parse(formData);

        const response = await fetch(`http://192.168.1.155:3000/api/search/user?type=username&data=${validatedData.username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ available: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.available === undefined) throw new AppError('Available property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                available: data.available
            }
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/username`, {
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

export async function checkIfEmailIsAvailable(formData: { email: string }): Promise<ApiResponse<{ available: boolean }>> {
    try {
        const validatedData = emailSchema.parse(formData);

        const response = await fetch(`http://192.168.1.155:3000/api/search/user?type=email&data=${validatedData.email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ available: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.available === undefined) throw new AppError('Available property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                available: data.available
            }
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/email`, {
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/birthday`, {
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

        const response = await fetch(`http://192.168.1.155:3000/api/users/password`, {
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

export async function updateProfile(formData: UserUpdateProfileType): Promise<ApiResponse<{ profile: Pick<LoggedInUserDataType, 'profile'>['profile'] }>> {
    try {
        const token = await getCurrentUserToken();
        userUpdateProfileSchema.parse(formData);
        const newFormData = new FormData();

        if (formData.name) {
            newFormData.append('name', String(formData.name));
        }

        if (formData.bio) {
            newFormData.append('bio', String(formData.bio));
        }

        if (formData.location) {
            newFormData.append('location', String(formData.location));
        }

        if (formData.website) {
            newFormData.append('website', String(formData.website));
        }

        if (formData.profilePicture) {
            newFormData.append('profilePicture', formData.profilePicture);
        }

        if (formData.bannerPicture) {
            newFormData.append('bannerPicture', formData.bannerPicture);
        }

        newFormData.append('removeProfilePicture', String(formData.removeProfilePicture));
        newFormData.append('removeBannerPicture', String(formData.removeBannerPicture));

        const response = await fetch(`http://192.168.1.155:3000/api/users/updateProfile`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: newFormData
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ profile: Pick<LoggedInUserDataType, 'profile'>['profile'] }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.profile === undefined) throw new AppError('Profile property is missing in data response', 404, 'MISSING_PROPERTY');

        revalidateTag('loggedInUser');

        return {
            success: true,
            data: {
                profile: data.profile
            },
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