'use server';

import { getCurrentTemporaryUserToken, getCurrentUserToken } from '@/data-acess-layer/auth';
import { createTemporarySession, getUserSessionToken, verifySession, removeTemporarySession, createSession, decryptSession } from '@/lib/session';
import { fetchWithNoAuth } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { ApiResponse, AppError, emailSchema, ErrorResponse, FormLogInUserDataType, FormTemporaryUserBasicDataType, FormTemporaryUserPasswordType, FormTemporaryUserProfilePictureType, FormTemporaryUserUsernameType, isZodError, logInUserSchema, SuccessfulRegisterResponseType, SuccessResponse, temporaryUserBasicDataSchema, temporaryUserPasswordSchema, temporaryUserProfilePictureSchema, temporaryUserUsernameSchema, usernameSchema } from 'tweetly-shared';

// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------- AUTH -----------------------------------------------------
// ---------------------------------------------------------------------------------------------------------

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
export async function loginUser(formData: FormLogInUserDataType): Promise<ApiResponse<{ type: 'user' | 'temporary' }>> {
    const response = await fetchWithNoAuth<{ token: string }>('http://192.168.1.155:3000/api/auth/login', {
        method: 'POST',
        body: formData,
    });

    if (response.success) {
        const { token } = response.data;

        const payload = await decryptSession(token);
        if (!payload) {
            throw new AppError('Payload is missing in JWT', 404, 'MISSING_PAYLOAD');
        } else if (payload.type === 'user') {
            await createSession(token);
        } else if (payload.type === 'temporary') {
            await createTemporarySession(token);
        } else {
            throw new AppError('Payload is incorrect', 404, 'INCORRECT_PAYLOAD');
        }

        return {
            success: true,
            data: {
                type: payload.type
            },
        };
    }

    return response;
};
