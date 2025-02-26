'use client';
import React, { useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { userUpdatePasswordSchema } from '@/lib/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { changePassword } from '@/actions/actions';
import { getErrorMessage } from 'tweetly-shared';

type FormData = z.infer<typeof userUpdatePasswordSchema>;

export default function ChangePassword() {
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        resetField,
    } = useForm<FormData>({ resolver: zodResolver(userUpdatePasswordSchema) });

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await changePassword(data);

            if (response !== true) {
                throw new Error(response);
            }

            setCustomError(null);
            setPasswordChanged(true);
            reset();
        } catch (error) {
            const errorMessage = getErrorMessage(error);

            if (errorMessage === 'Incorrect current password') {
                setError("currentPassword", { type: "manual", message: errorMessage });
                resetField("currentPassword", { keepError: true });
            } else {
                setCustomError(errorMessage);
            }

            console.error(error);
        }
    }

    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header='Change your password' />
            <div className='feed-hr-line'></div>

            <div className='px-4 mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <Input {...register("currentPassword")} type="password" placeholder="Current password" />
                    {errors.currentPassword && (
                        <p className="error-msg">{`${errors.currentPassword.message}`}</p>
                    )}

                    <div className='feed-hr-line'></div>
                    <Input {...register("newPassword")} type="password" placeholder="New password" />
                    {errors.newPassword && (
                        <p className="error-msg">{`${errors.newPassword.message}`}</p>
                    )}

                    <Input {...register("newConfirmPassword")} type="password" placeholder="Confirm new password" />
                    {errors.newConfirmPassword && (
                        <p className="error-msg">{`${errors.newConfirmPassword.message}`}</p>
                    )}

                    {customError && (
                        <div className='error-msg'>{customError}</div>
                    )}

                    {passwordChanged && (
                        <div className='text-green-400 text-14'>Password successfully changed</div>
                    )}

                    {isSubmitting
                        ? <Button className='bg-primary text-white-1 font-bold' disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button className='bg-primary text-white-1 font-bold'>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
