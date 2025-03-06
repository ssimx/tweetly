'use client';
import React, { useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/UserContextProvider';
import { changeEmail } from '@/actions/actions';
import { getErrorMessage, isZodError, userUpdateEmailSchema, UserUpdateEmailType } from 'tweetly-shared';

export default function ChangeEmail() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [emailChanged, setEmailChanged] = useState<boolean | null>(null);
    const [customError, setCustomError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        watch,
    } = useForm<UserUpdateEmailType>({
        resolver: zodResolver(userUpdateEmailSchema),
        defaultValues: { newEmail: loggedInUser.email }
    });

    const emailWatch = watch("newEmail");

    const onSubmit = async (formData: UserUpdateEmailType) => {
        if (isSubmitting) return;
        setCustomError(null);
        setEmailChanged(false);

        try {
            const response = await changeEmail(formData);
            console.log(response)
            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'EMAIL_TAKEN') {
                    setCustomError('Email is already taken');
                    return;
                }
                else throw new Error(response.error.message);
            }

            setEmailChanged(true);
            refetchUserData();
        } catch (error: unknown) {
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof UserUpdateEmailType, {
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
            <SettingsHeaderInfo header='Change your email' />
            <div className='feed-hr-line'></div>

            <div className='px-4 mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <Input
                        {...register("newEmail")}
                        type="text" placeholder="Email"
                    />

                    {errors.newEmail && (
                        <p className="error-msg">{`${errors.newEmail.message}`}</p>
                    )}

                    {customError !== null && (
                        <div className='error-msg'>{customError}</div>
                    )}

                    {customError === null && emailChanged && (
                        <div className='text-green-400 text-14'>Email successfully changed</div>
                    )}

                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button
                            disabled={(isSubmitting || emailWatch.toLowerCase() === loggedInUser.email.toLowerCase()) && true}
                            className='bg-primary font-bold'>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
