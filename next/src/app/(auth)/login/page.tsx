'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Apple } from "lucide-react";
import { FormLogInUserDataType, getErrorMessage, isZodError, logInUserSchema } from 'tweetly-shared';
import { loginUser } from '@/actions/actions';
import { useState } from 'react';

export default function LogIn() {
    const router = useRouter();
    const [isError, setIsError] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormLogInUserDataType>({ resolver: zodResolver(logInUserSchema) });

    const onSubmit = async (formData: FormLogInUserDataType) => {
        if (isSubmitting) return;

        try {
            const response = await loginUser(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'USER_NOT_FOUND') {
                    setError('usernameOrEmail' as keyof FormLogInUserDataType, {
                        type: 'manual',
                        message: response.error.message
                    });
                    return;
                } else if (response.error.code === 'INCORRECT_PASSWORD') {
                    setError('password' as keyof FormLogInUserDataType, {
                        type: 'manual',
                        message: response.error.message
                    });
                    return;
                }
                else throw new Error(response.error.message);
            }

            setIsError(false);
            if (response.data?.type === 'user') router.replace('/')
            else if (response.data?.type === 'temporary') router.replace('/signup');
            router.refresh();
        } catch (error: unknown) {
            // Handle validation errors
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof FormLogInUserDataType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                console.error('Registration error:', errorMessage);
                setIsError(true);
            }
        }
    };

    return (
        <div className='flex flex-col justify-between gap-8 w-3/4 min-w-[300px] md:w-1/2'>
            <h1 className='text-30 font-bold text-center'>
                Sign in to Tweetly
            </h1>
            <div className='flex flex-col justify-between items-center gap-8'>
                <div className='flex flex-col gap-4 w-3/5'>
                    <Button className='rounded-2xl border border-gray-200 bg-transparent focus-visible:bg-none hover:text-white-1'>
                        <Mail className="mr-2 h-4 w-4" /> Sign in with Email
                    </Button>
                    <Button className='rounded-2xl border border-gray-200 bg-transparent focus-visible:bg-none hover:text-white-1'>
                        <Apple className="mr-2 h-4 w-4" /> Sign in with Apple
                    </Button>
                </div>

                <p>Or</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <Input {...register("usernameOrEmail")} placeholder="Username or email address" />
                    {errors.usernameOrEmail && (
                        <p className="error-msg">{`${errors.usernameOrEmail.message}`}</p>
                    )}

                    <Input {...register("password")} type="password" placeholder="password" />
                    {errors.password && (
                        <p className="error-msg">{`${errors.password.message}`}</p>
                    )}

                    {isSubmitting
                        ? (
                            <Button
                                disabled
                                className='bg-primary font-bold text-white-1'
                            >
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in
                            </Button>
                        )
                        : (
                            <Button className='bg-primary font-bold text-white-1'>
                                Log in
                            </Button>
                        )
                    }
                    
                    {isError && (
                        <p className="!mt-0 error-msg text-center">Something wen&apos;t wrong, please contact the support</p>
                    )}
                </form>
                <p>Don&apos;t have an account? <Link href='/signup' className='font-bold hover:text-primary'>Sign up</Link></p>
            </div>
        </div>
    )
}