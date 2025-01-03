'use client';
import React, { useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { settingsChangePassword } from '@/lib/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

type FormData = z.infer<typeof settingsChangePassword>;

export default function ChangePassword() {
    const [passwordChanged, setPasswordChanged] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        resetField,
    } = useForm<FormData>({ resolver: zodResolver(settingsChangePassword) });

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/users/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                setPasswordChanged(false);
                throw new Error(errorData.error);
            }

            reset();
            setPasswordChanged(true);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Incorrect current password') {
                    setError("currentPassword", { type: "manual", message: error.message });
                    resetField("currentPassword", { keepError: true });
                } else {
                    console.error(error);
                    reset();
                }
            }
        }
    };

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
                    {passwordChanged && (
                        <div className='text-green-400 text-14'>Password successfully changed</div>
                    )

                    }
                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming
                        </Button>
                        : <Button className='bg-primary font-bold'>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
