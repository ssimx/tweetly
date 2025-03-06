'use client';
import React, { useEffect, useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/UserContextProvider';
import { changeUsername, checkIfUsernameIsAvailable } from '@/actions/actions';
import { AppError, getErrorMessage, isZodError, SuccessResponse, usernameSchema, userUpdateUsernameSchema, UserUpdateUsernameType } from 'tweetly-shared';

export default function ChangeUsername() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [isValidating, setIsValidating] = useState(false);
    const [validatedUsername, setValidatedUsername] = useState<string | null>(null);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [usernameChanged, setUsernameChanged] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        watch,
    } = useForm<UserUpdateUsernameType>({
        resolver: zodResolver(userUpdateUsernameSchema),
        defaultValues: { newUsername: loggedInUser.username }
    });

    const usernameWatch = watch("newUsername");

    // check for new username availability
    useEffect(() => {
        if (isSubmitting || isValidating) return;

        const trimmedUsername = usernameWatch.trim();
        if (trimmedUsername === validatedUsername) return;

        setIsUsernameAvailable(null);
        setUsernameChanged(false);
        setCustomError(null);

        const timeoutId = setTimeout(async () => {
            try {
                usernameSchema.parse({ username: trimmedUsername });
                setValidatedUsername(trimmedUsername);

                const encodedSearch = encodeURIComponent(trimmedUsername);

                setIsValidating(true);
                const response = await checkIfUsernameIsAvailable({ username: encodedSearch });
                setValidatedUsername(usernameWatch);

                if (!response.success) {
                    if (response.error.details) throw new z.ZodError(response.error.details);
                    else throw new Error(response.error.message);
                }

                const { data } = response as SuccessResponse<{ available: boolean }>;
                if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                else if (data.available === undefined) throw new AppError('Available property is missing in data response', 404, 'MISSING_PROPERTY');

                setIsUsernameAvailable(data.available);
            } catch (error: unknown) {
                if (isZodError(error)) {
                    error.issues.forEach((detail) => {
                        if (detail.path && detail.message) {
                            setError(detail.path[0] as keyof UserUpdateUsernameType, {
                                type: 'manual',
                                message: detail.message
                            });
                        }
                    });
                } else {
                    const errorMessage = getErrorMessage(error);
                    console.error('Error:', errorMessage);
                    setCustomError(errorMessage ?? 'Something went wrong, refresh the page or remove cookies. If problem persists, contact the support');
                    reset();
                }
            } finally {
                setIsValidating(false);
            }
        }, 500);

        return (() => {
            clearTimeout(timeoutId);
        });
    }, [isSubmitting, isValidating, usernameWatch, validatedUsername, reset, setCustomError, setError]);

    const onSubmit = async (formData: UserUpdateUsernameType) => {
        if (isSubmitting || isValidating) return;
        setCustomError(null);

        try {
            const response = await changeUsername(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'USERNAME_TAKEN') {
                    setCustomError('Username is already taken');
                    return;
                }
                else throw new Error(response.error.message);
            }

            setIsUsernameAvailable(null);
            setUsernameChanged(true);
            refetchUserData();
        } catch (error: unknown) {
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof UserUpdateUsernameType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                setCustomError(`${errorMessage ?? 'Something went wrong'}, refresh the page or remove cookies. If problem persists, contact the support`);
            }
        }
    };

    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header='Change your username' />
            <div className='feed-hr-line'></div>

            <div className='px-4 mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <Input
                        {...register("newUsername")}
                        type="text" placeholder="Username"
                        maxLength={15}
                    />
                    {errors.newUsername && (
                        <p className="error-msg">{`${errors.newUsername.message}`}</p>
                    )}

                    {customError !== null && (
                        <div className='error-msg'>{customError}</div>
                    )}

                    {customError === null && isUsernameAvailable && (
                        <p className="error-msg !text-green-400">{`Username is available`}</p>
                    )}

                    {customError === null && isUsernameAvailable === false && loggedInUser.username !== usernameWatch && (
                        <p className="error-msg !text-red-500">{`Username is not available`}</p>
                    )}

                    {customError === null && usernameChanged && (
                        <div className='error-msg !text-green-400'>Username successfully changed</div>
                    )}

                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button disabled={!isUsernameAvailable || loggedInUser.username.toLowerCase() === usernameWatch.toLowerCase()} className='bg-primary font-bold'>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
