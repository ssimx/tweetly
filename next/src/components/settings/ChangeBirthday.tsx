'use client';
import React, { useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/UserContextProvider';
import { DateOfBirthSelect } from '../forms/DateOfBirthSelect';
import { changeBirthday } from '@/actions/actions';
import { getErrorMessage, isZodError, userUpdateBirthdaySchema, UserUpdateBirthdayType } from 'tweetly-shared';
import { z } from 'zod';

export default function ChangeBirthday() {
    const { loggedInUser, refetchUserData } = useUserContext();
    const [birthdayChanged, setBirthdayChanged] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        getValues,
        watch,
        setError
    } = useForm<UserUpdateBirthdayType>({
        resolver: zodResolver(userUpdateBirthdaySchema),
        defaultValues: {
            year: new Date(loggedInUser.dateOfBirth).getFullYear(),
            month: new Date(loggedInUser.dateOfBirth).getMonth() + 1,
            day: new Date(loggedInUser.dateOfBirth).getDate(),
        }
    });

    const currentYear = watch('year');
    const currentMonth = watch('month');
    const currentDay = watch('day');

    const onSubmit = async (formData: UserUpdateBirthdayType) => {
        if (isSubmitting) return;
        setCustomError(null);
        setBirthdayChanged(false);

        try {
            const response = await changeBirthday(formData);
            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else throw new Error(response.error.message);
            }

            setBirthdayChanged(true);
            refetchUserData();
        } catch (error: unknown) {
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof UserUpdateBirthdayType, {
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
            <SettingsHeaderInfo header='Change your birthday' />
            <div className='feed-hr-line'></div>

            <div className='px-4 mt-4'>
                <form suppressHydrationWarning onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <DateOfBirthSelect settingsRegister={register} settingsGetValues={getValues} settingsSetValues={setValue} errors={errors} />

                    {customError && (
                        <p className="error-msg-date">{customError}</p>
                    )}

                    {customError === null && birthdayChanged && (
                        <div className='text-green-400 text-14'>Birthday successfully changed</div>
                    )}

                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button className='bg-primary font-bold'
                            disabled={
                                new Date(loggedInUser.dateOfBirth).getFullYear() === currentYear
                                && new Date(loggedInUser.dateOfBirth).getMonth() + 1 === currentMonth
                                && new Date(loggedInUser.dateOfBirth).getDate() === currentDay
                            }>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
