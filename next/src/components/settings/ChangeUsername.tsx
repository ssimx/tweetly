'use client';
import React, { useCallback, useEffect, useState } from 'react'
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
import { debounce } from 'lodash';

export default function ChangeUsername() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string>(loggedInUser.username);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        watch,
    } = useForm<UserUpdateUsernameType>({
        resolver: zodResolver(userUpdateUsernameSchema),
        defaultValues: { newUsername: currentUsername }
    });

    const usernameWatch = watch("newUsername");

    const buttonEnabled = !(usernameWatch.toLowerCase() === loggedInUser.username.toLowerCase());

    // Create a debounced function for checking username availability
    const checkUsernameAvailability = useCallback(
        (username: string) => {
            const debouncedCheck = debounce(async (usernameToCheck: string) => {
                if (!usernameToCheck || usernameToCheck.trim() === currentUsername) {
                    return;
                }

                setIsChecking(true);
                setIsAvailable(null);
                setFeedback(null);

                try {
                    usernameSchema.parse({ username: usernameToCheck.trim() });
                    const encodedUsername = encodeURIComponent(usernameToCheck.trim());
                    const response = await checkIfUsernameIsAvailable({ username: encodedUsername });
                    console.log(response)

                    if (!response.success) {
                        if (response.error.details) throw new z.ZodError(response.error.details);
                        else throw new Error(response.error.message);
                    }

                    const { data } = response as SuccessResponse<{ available: boolean }>;
                    if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                    else if (data.available === undefined) throw new AppError('Available property is missing in data response', 404, 'MISSING_PROPERTY');

                    setIsAvailable(data.available);
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
                        setFeedback(errorMessage ?? 'Something went wrong, refresh the page or remove cookies. If problem persists, contact the support');
                    }
                } finally {
                    setIsChecking(false);
                }
            }, 500);

            debouncedCheck(username);
            return debouncedCheck;
        },
        [currentUsername, setError]
    );

    // Call the debounced function when username changes
    useEffect(() => {
        setIsAvailable(null);

        // For cancel method
        let debouncedCheckFn: ReturnType<typeof debounce> | null = null;

        if (usernameWatch && usernameWatch.trim() !== currentUsername && !isSubmitting) {
            debouncedCheckFn = checkUsernameAvailability(usernameWatch);
        }

        // If username is the same as current user's, reset states
        if (usernameWatch && usernameWatch.trim() === currentUsername) {
            setIsAvailable(null);
            // Keep the feedback if username has updated
            setFeedback((current) => current?.includes('success') ? current : null);
        }

        // Cleanup debounced function on unmount or when dependencies change
        return () => {
            if (debouncedCheckFn) {
                debouncedCheckFn.cancel();
            }
        };
    }, [usernameWatch, currentUsername, isSubmitting, checkUsernameAvailability]);

    const onSubmit = async (formData: UserUpdateUsernameType) => {
        if (isSubmitting || isChecking) return;
        setFeedback(null);

        try {
            const response = await changeUsername(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'USERNAME_TAKEN') {
                    setFeedback('Username is already taken');
                    return;
                }
                else throw new Error(response.error.message);
            }

            setCurrentUsername(formData.newUsername);
            setIsAvailable(null);
            setFeedback('Username successfully changed');
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
                setFeedback(`${errorMessage ?? 'Something went wrong'}, refresh the page or remove cookies. If problem persists, contact the support`);
            }
        }
    };

    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header='Change your username' />
            <div className='feed-hr-line'></div>

            <div className='px-4 mt-4'>
                <form suppressHydrationWarning onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <Input
                        {...register("newUsername")}
                        type="text" placeholder="Username"
                        maxLength={15}
                    />
                    {errors.newUsername && (
                        <p className="error-msg">{`${errors.newUsername.message}`}</p>
                    )}

                    {feedback && <p className={`error-msg ${feedback.includes('success') ? '!text-green-400' : '!text-red-500'}`}>{feedback}</p>}

                    {isAvailable !== null && !feedback && (
                        <p className={`error-msg ${isAvailable ? '!text-green-400' : '!text-red-500'}`}>
                            {isAvailable ? 'Username is available' : 'Username is not available'}
                        </p>
                    )}

                    <Button
                        className='text-primary-text-color-white'
                        disabled={isSubmitting || !isAvailable || !buttonEnabled}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>

                </form>
            </div>
        </div>
    )
}
