'use client';
import React, { useEffect, useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { searchUsernameSchema, settingsChangeUsername } from '@/lib/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/UserContextProvider';
import { getErrorMessage } from '@/lib/utils';

type FormData = z.infer<typeof settingsChangeUsername>;

export default function ChangeUsername() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [usernameChanged, setUsernameChanged] = useState(false);
    const [isValidating, setIsValidating] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
        watch,        
    } = useForm<FormData>({ 
        resolver: zodResolver(settingsChangeUsername),
        defaultValues: { newUsername: loggedInUser.username }
    });

    const newUsername = watch("newUsername"); // Watch for changes to the username field

    useEffect(() => {
        setIsValidating(true);
        if (isSubmitting) return;
        else if (!newUsername) return;
        else if (newUsername === loggedInUser.username) {
            clearErrors("newUsername");
            return;
        };

        const timeout = setTimeout(async () => {
            setUsernameChanged(false);

            try {
                // Decode query before validation
                const decodedSearch = decodeURIComponent(newUsername);
                searchUsernameSchema.parse({ q: decodedSearch });

                // Encode query for API requests
                const encodedSearch = encodeURIComponent(decodedSearch);

                const searchResponse = await fetch(`/api/search/user?q=${encodedSearch}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const usernameTaken = await searchResponse.json();

                if (usernameTaken) {
                    setError("newUsername", { type: "manual", message: 'That username has been taken. Please choose another.' });
                } else {
                    clearErrors("newUsername");
                    setIsValidating(false);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }, 500);

        return (() => {
            clearTimeout(timeout);
            setIsValidating(false);
        });
    }, [newUsername, setError, clearErrors, loggedInUser.username, isSubmitting]);

    const onSubmit = async (data: FormData) => {
        if (isSubmitting || isValidating) return;

        try {
            const response = await fetch('/api/users/username', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                setUsernameChanged(false);
                throw new Error(getErrorMessage(errorData));
            }

            setUsernameChanged(true);
            refetchUserData();
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'That username has been taken. Please choose another.') {
                    setError("newUsername", { type: "manual", message: error.message });
                } else if (error.message === "New username must be different than the current one.") {
                    setError("newUsername", { type: "manual", message: error.message });
                } else {
                    console.error(error);
                    reset();
                }
            } else {
                console.error(error);
                reset();
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
                        />
                    {errors.newUsername && (
                        <p className="error-msg">{`${errors.newUsername.message}`}</p>
                    )}

                    {usernameChanged && (
                        <div className='text-green-400 text-14'>Username successfully changed</div>
                    )}

                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button disabled={ isSubmitting || isValidating && true } className='bg-primary font-bold'>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
