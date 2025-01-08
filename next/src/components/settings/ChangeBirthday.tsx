'use client';
import React, { useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { settingsChangeBirthday } from '@/lib/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/UserContextProvider';
import { DateOfBirthSelect } from '../DateOfBirthSelect';

type FormData = z.infer<typeof settingsChangeBirthday>;

export default function ChangeBirthday() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [birthdayChanged, setBirthdayChanged] = useState(false);
    const [sameBirthdayError, setSameBirthdayError] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setValue,
        setError,
        getValues,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(settingsChangeBirthday),
        defaultValues: { 
            year: String(new Date(loggedInUser.dateOfBirth).getFullYear()),
            month: String(new Date(loggedInUser.dateOfBirth).getMonth() + 1),
            day: String(new Date(loggedInUser.dateOfBirth).getDate()),
        }
    });

    const currentYear = watch('year');
    const currentMonth = watch('month');
    const currentDay = watch('day');

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/users/birthday', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                setBirthdayChanged(false);
                throw new Error(errorData.error);
            }

            setBirthdayChanged(true);
            setSameBirthdayError(false);
            refetchUserData();
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User must be older than 13') {
                    setError('year', { type: 'manual', message: error.message });
                } else if (error.message === "New birth date must be different than the current one") {
                    setSameBirthdayError(true);
                } else {
                    console.error(error);
                    reset();
                }
            }
        }
    };

    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header='Change your birthday' />
            <div className='feed-hr-line'></div>

            <div className='px-4 mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <DateOfBirthSelect settingsRegister={register} settingsGetValues={getValues} settingsSetValues={setValue} errors={errors} />

                    {sameBirthdayError && (
                        <p className="error-msg-date">New birth date must be different than the current one.</p>
                    )}

                    {birthdayChanged && (
                        <div className='text-green-400 text-14'>Birthday successfully changed</div>
                    )}

                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button className='bg-primary font-bold' 
                            disabled={
                                (String(new Date(loggedInUser.dateOfBirth).getFullYear()) === currentYear)
                                && (String(new Date(loggedInUser.dateOfBirth).getMonth() + 1) === currentMonth)
                                && (String(new Date(loggedInUser.dateOfBirth).getDate()) === currentDay)
                            }>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
