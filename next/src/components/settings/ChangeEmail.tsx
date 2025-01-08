'use client';
import React, { useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { settingsChangeEmail } from '@/lib/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/UserContextProvider';

type FormData = z.infer<typeof settingsChangeEmail>;

export default function ChangeEmail() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [emailChanged, setEmailChanged] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(settingsChangeEmail),
        defaultValues: { newEmail: loggedInUser.email }
    });

    const newEmail = watch("newEmail"); // Watch for changes to the email field

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/users/email', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                setEmailChanged(false);
                throw new Error(errorData.error);
            }

            setEmailChanged(true);
            refetchUserData();
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'That email has been taken. Please choose another.') {
                    setError("newEmail", { type: "manual", message: error.message });
                } else if (error.message === "New email must be different than the current one.") {
                    setError("newEmail", { type: "manual", message: error.message });
                } else {
                    console.error(error);
                    reset();
                }
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

                    {emailChanged && (
                        <div className='text-green-400 text-14'>Email successfully changed</div>
                    )}

                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button disabled={newEmail.toLowerCase() === loggedInUser.email} className='bg-primary font-bold'>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
