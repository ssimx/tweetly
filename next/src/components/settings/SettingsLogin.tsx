'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import SettingsHeaderInfo from "./SettingsHeaderInfo";
import { verifyLoginPasswordForSettings } from '@/actions/actions';
import { FormUserSettingsAccessType, getErrorMessage, isZodError, userSettingsAccessSchema } from 'tweetly-shared';
import { useState } from 'react';

export default function SettingsLogin() {
    const [customError, setCustomError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormUserSettingsAccessType>({ resolver: zodResolver(userSettingsAccessSchema) });

    const onSubmit = async (formData: FormUserSettingsAccessType) => {
        if (isSubmitting) return;

        try {
            setCustomError(null);
            const response = await verifyLoginPasswordForSettings(formData);

            if (!response.success) {
                console.log(response)
                if (response.error.details) throw new z.ZodError(response.error.details);
                else throw new Error(response.error.message);
            }
        } catch (error: unknown) {
            // Handle validation errors
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        console.error(detail.message);
                        setError(detail.path[0] as keyof FormUserSettingsAccessType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                console.error('Something went wrong:', errorMessage);
                setCustomError(errorMessage);
            }
        }
    };

    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header="Account information" />
            <div className='feed-hr-line'></div>
            <div className='flex flex-col px-4 gap-y-4 mt-2'>
                <div className='flex flex-col gap-y-1'>
                    <h3 className='text-16 font-semibold'>Confirm your password</h3>
                    <p className='text-14 text-secondary-text'>Please enter your password to continue.</p>
                </div>

                <div>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <Input
                            {...register("password", {
                                onChange: () => setCustomError(null),
                            })}
                            type="password"
                            placeholder="password"
                            className='bg-transparent'
                        />
                        {errors.password && (
                            <p className="error-msg">{`${errors.password.message}`}</p>
                        )}
                        {customError && (
                            <p className="error-msg">{`${customError}`}</p>
                        )}
                        {isSubmitting
                            ? <Button className='text-white-1' disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Confirming
                            </Button>
                            : <Button className='bg-primary text-white-1 font-bold'>Confirm</Button>
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}
