'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Apple, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { DateOfBirthSelect } from "@/components/forms/DateOfBirthSelect";
import { registerUser } from '@/actions/actions';
import { registerUserDataSchema, RegisterUserDataType, TemporaryUserDataType } from 'tweetly-shared';
import { z } from 'zod';
import { getErrorMessage } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function SignUpProcess({ user }: { user: TemporaryUserDataType | null }) {
    const router = useRouter();
    const [registrationStep, setRegistrationStep] = useState<number | undefined>(undefined);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<RegisterUserDataType>({ resolver: zodResolver(registerUserDataSchema) });

    const onSubmit = async (formData: unknown) => {
        if (isSubmitting) return;

        try {
            if (registrationStep === 0);

            const response = await registerUser(data);

            if (!response.success) {
                if (response.error?.details) {
                    response.error.details.forEach((detail) => {
                        if (detail.path && detail.message) {
                            setError(detail.path[0] as keyof RegisterUserDataType, {
                                type: 'manual',
                                message: detail.message
                            });
                        }
                    });
                } else {
                    throw new Error(response.error.message);
                }
            }

            router.replace('/');
            router.refresh();
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof RegisterUserDataType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                console.error('Registration error:', errorMessage);
            }

            reset();
        }
    };

    const completeRegistration = async (data: RegisterUserDataType) => {

    };

    useEffect(() => {
        if (user === null) {
            setRegistrationStep(0);
        } else if (!(user.profileName && user.email && user.dateOfBirth)) {
            setRegistrationStep(0);
        } else if (user.emailVerified === false) {
            setRegistrationStep(1);
        } else if (!user.password) {
            setRegistrationStep(2);
        } else if (!user.username) {
            setRegistrationStep(3);
        } else if (!user.profilePicture) {
            setRegistrationStep(4);
        }
    }, [user]);

    return (
        <div className='flex flex-col justify-between gap-8 w-3/4 min-w-[300px] md:w-1/2'>
            <h1 className='text-30 font-bold text-center'>
                Create your account
            </h1>
            <div className='flex flex-col justify-between items-center gap-8'>
                <div className='flex flex-col gap-4 w-3/5'>
                    <Button className='rounded-2xl border border-gray-200 bg-transparent focus-visible:bg-none hover:text-white-1'>
                        <Apple className="mr-2 h-4 w-4" /> Sign up with Apple
                    </Button>
                </div>

                <p>Or</p>

                <Button className='bg-primary text-white-1 rounded-2xl border border-gray-200 focus-visible:bg-none'>
                    <Apple className="mr-2 h-4 w-4" /> Sign up with email
                </Button>

                <p>Already have an account? <Link href='/login' className='font-bold hover:text-primary'>Log in</Link></p>
            </div>
        </div>
    )
}