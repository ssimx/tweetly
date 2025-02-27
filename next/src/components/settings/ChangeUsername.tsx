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
import { changeUsername, checkIfUsernameIsAvailable } from '@/actions/actions';
import { getErrorMessage } from 'tweetly-shared';

type FormData = z.infer<typeof settingsChangeUsername>;

export default function ChangeUsername() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [newUsername, setNewUsername] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(true);
    const [newUsernameAvailable, setNewUsernameAvailable] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);

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

    const usernameText = watch("newUsername"); // Watch for changes to the username field

    // check for new username availability
    useEffect(() => {
        setIsValidating(true);
        if (isSubmitting) return;
        else if (!usernameText) return;
        else if (usernameText === loggedInUser.username) {
            clearErrors("newUsername");
            return;
        } else if (newUsername === usernameText) {
            return;
        }

        // reset states after text field has been changed
        setNewUsername(null);
        setCustomError(null);

        const timeout = setTimeout(async () => {

            try {
                // Decode query before validation
                const decodedSearch = decodeURIComponent(usernameText);
                searchUsernameSchema.parse({ q: decodedSearch });

                // Encode query for API requests
                const encodedSearch = encodeURIComponent(decodedSearch);

                const usernameAvailable = await checkIfUsernameIsAvailable({ username: encodedSearch });

                if (usernameAvailable !== true) {
                    setNewUsernameAvailable(false);
                    setError("newUsername", { type: "manual", message: 'That username has been taken. Please choose another.' });
                } else {
                    clearErrors("newUsername");
                    setIsValidating(false);
                    setNewUsernameAvailable(true);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }, 500);

        return (() => {
            clearTimeout(timeout);
            setIsValidating(false);
        });
    }, [usernameText, newUsername, setError, clearErrors, loggedInUser.username, isSubmitting]);

    const onSubmit = async (data: FormData) => {
        if (isSubmitting || isValidating) return;

        try {
            const response = await changeUsername(data);

            if (response !== true) {
                throw new Error(response);
            }

            setCustomError(null);
            setNewUsername(data.newUsername);
            setNewUsernameAvailable(false);
            await refetchUserData();
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            console.error(errorMessage);

            if (errorMessage === 'That username has been taken. Please choose another.') {
                setError("newUsername", { type: "manual", message: errorMessage });
            } else if (errorMessage === "New username must be different than the current one.") {
                setError("newUsername", { type: "manual", message: errorMessage });
            } else {
                setCustomError(getErrorMessage(error));
            }

            setNewUsername(null);
            setNewUsernameAvailable(false);
            reset();
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

                    {customError !== null && (
                        <div className='error-msg'>{customError}</div>
                    )}

                    {newUsernameAvailable && (
                        <p className="error-msg !text-green-400">{`Username is available`}</p>
                    )}

                    {newUsername !== null && (
                        <div className='error-msg !text-green-400'>Username successfully changed</div>
                    )}


                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button disabled={isSubmitting || isValidating && true} className='bg-primary font-bold'>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
