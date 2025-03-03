'use server';
import { getCurrentTemporaryUserToken, getCurrentUserToken, verifyCurrentUserSettingsToken } from "@/data-acess-layer/auth";
import { createSession, createSettingsSession, createTemporarySession, decryptSession, getUserSessionToken, removeSettingsToken, removeTemporarySession, updateSessionToken, verifySession } from '@/lib/session';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    ApiResponse,
    AppError,
    ErrorResponse,
    newPostDataSchema,
    NewPostDataType,
    SuccessfulRegisterResponseType,
    SuccessResponse,
    userSettingsAccessSchema,
    UserSettingsAccessType,
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
    getErrorMessage,
    logInUserSchema,
    FormLogInUserDataType,
    usernameSchema,
    usernameOrEmailAvailibilitySchema,
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

        const response = await fetch(`http://localhost:3000/api/auth/register`, {
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
        else if (!data.token) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

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

        const response = await fetch(`http://localhost:3000/api/auth/temporary/username`, {
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
    } catch (error) {

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
    formData?: FormTemporaryUserProfilePictureType
): Promise<ApiResponse<undefined>> {

    const sessionToken = await getUserSessionToken();
    if ((await verifySession(sessionToken)).isAuth) redirect('/');

    try {
        const temporaryToken = await getCurrentTemporaryUserToken();
        if (!temporaryToken) throw new AppError('User not logged in', 400, 'NOT_LOGGED_IN');

        formData && temporaryUserProfilePictureSchema.parse(formData);

        const response = await fetch(`http://localhost:3000/api/auth/temporary/profilePicture`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${temporaryToken}`,
            },
            ...(formData?.image && {
                body: (() => {
                    const newFormData = new FormData();
                    newFormData.append('image', formData.image);
                    return newFormData;
                })(),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ token: string }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!data.token) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

        console.log(data.token)
        await removeTemporarySession();
        await createSession(data.token);

        return {
            success: true,
            data: undefined,
        }
    } catch (error) {

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

        const response = await fetch(`http://localhost:3000/api/auth/login`, {
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
        else if (!data.token) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

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

export async function createPost(data: unknown) {
    const token = await getCurrentUserToken();

    try {
        const validatedData = newPostDataSchema.parse(data);
        const response = await fetch('http://localhost:3000/api/posts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        const postData = await response.json() as NewPostDataType;
        return postData;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        redirect(`http://localhost:3000/`);
    }
};

export async function repostPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/repost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeRepostPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeRepost/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function likePost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/like/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeLikePost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeLike/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function bookmarkPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/bookmark/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeBookmarkPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeBookmark/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function hardRedirect(uri: string) {
    console.log('redirecting');
    return redirect(uri);
};

// ---------------------------------------------------------------------------------------------------------
//                                             ACCOUNT ACTIONS
// ---------------------------------------------------------------------------------------------------------

export async function verifyLoginPasswordForSettings(data: UserSettingsAccessType) {
    const sessionToken = await getCurrentUserToken();

    try {
        const alreadyValidSettingsToken = await verifyCurrentUserSettingsToken();
        if (alreadyValidSettingsToken) {
            throw new Error('User already has valid token');
        }

        const validatedData = userSettingsAccessSchema.parse(data);
        const response = await fetch('http://localhost:3000/api/auth/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const settingsToken = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'token' in res) {
                return res.token as string;
            }
            throw new Error('Invalid response format');
        });

        await createSettingsSession(settingsToken);

        return true;
    } catch (error) {
        console.log(error)
        return getErrorMessage(error);
    }
};

export async function checkIfUsernameIsAvailable(formData: { username: string }): Promise<ApiResponse<{ available: boolean }>> {
    try {
        const validatedData = usernameSchema.parse(formData);

        const response = await fetch(`http://localhost:3000/api/search/user?type=username&data=${validatedData.username}`, {
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

export async function changeUsername(data: UserUpdateUsernameType) {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            throw new Error('Invalid settings token');
        }

        const validatedData = userUpdateUsernameSchema.parse(data);

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
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const newSessionToken = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'token' in res) {
                return res.token as string
            }
            throw new Error('Invalid response format');
        });



        // don't need to update settings token because it's saving only user ID
        await updateSessionToken(newSessionToken);
        revalidateTag("loggedInUser");

        return true;
    } catch (error) {
        console.log(error)
        return getErrorMessage(error);
    }
};

export async function checkIfEmailIsAvailable(formData: { email: string }) {
    try {
        // Decode and validate type and data
        const decodedData = decodeURIComponent(formData.email);
        usernameOrEmailAvailibilitySchema.parse({ type: 'email', data: decodedData });

        // Encode query for backend API call
        const encodedData = encodeURIComponent(decodedData);

        const response = await fetch(`http://localhost:3000/api/search/user?type=email&data=${encodedData}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const available = await response.json() as boolean;
        return available;
    } catch (error) {
        console.log(error)
        return getErrorMessage(error);
    }
};

export async function changeEmail(data: UserUpdateEmailType) {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            throw new Error('Invalid settings token');
        }

        const validatedData = userUpdateEmailSchema.parse(data);

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
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const newSessionToken = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'token' in res) {
                return res.token as string
            }
            throw new Error('Invalid response format');
        });



        // don't need to update settings token because it's saving only user ID
        await updateSessionToken(newSessionToken);
        revalidateTag("loggedInUser");

        return true;
    } catch (error) {
        console.log(error)
        return getErrorMessage(error);
    }
};

export async function changeBirthday(data: UserUpdateBirthdayType) {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            throw new Error('Invalid settings token');
        }

        const validatedData = userUpdateBirthdaySchema.parse(data);

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
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        revalidateTag("loggedInUser");

        return true;
    } catch (error) {
        console.log(error)
        return getErrorMessage(error);
    }
};

export async function changePassword(data: UserUpdatePasswordType) {
    const sessionToken = await getCurrentUserToken();
    const settingsToken = await verifyCurrentUserSettingsToken();

    try {
        if (!settingsToken) {
            await removeSettingsToken();
            throw new Error('Invalid settings token');
        }

        const validatedData = userUpdatePasswordSchema.parse(data);

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
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        return true;
    } catch (error) {
        console.log(error)
        return getErrorMessage(error);
    }
};