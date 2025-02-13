'use client';

import { signUpSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Apple, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { DateOfBirthSelect } from "@/components/forms/DateOfBirthSelect";


type FormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<FormData>({ resolver: zodResolver(signUpSchema) });

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            router.replace('/');
            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'username and email') {
                    setError("username", { type: "manual", message: 'Username already exists' });
                    setError("email", { type: "manual", message: 'Email already in use' });
                } else if (error.message === 'username') {
                    setError("username", { type: "manual", message: 'Username already exists' });
                } else if (error.message === 'email') {
                    setError("email", { type: "manual", message: 'Email already in use' });
                } else {
                    console.error(error);
                    reset();
                }
            }
        }
    };

    return (
        <div className='flex flex-col justify-between gap-8 w-3/4 min-w-[300px] md:w-1/2'>
            <h1 className='text-30 font-bold text-center'>
                Create your account
            </h1>
            <div className='flex flex-col justify-between items-center gap-8'>
                <div className='flex flex-col gap-4 w-3/5'>
                    <Button className='social-media-connect-btn'>
                        <Mail className="mr-2 h-4 w-4" /> Sign up with Email
                    </Button>
                    <Button className='social-media-connect-btn'>
                        <Apple className="mr-2 h-4 w-4" /> Sign up with Apple
                    </Button>
                </div>

                <p>Or</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <Input {...register("username")} placeholder="username" />
                    {errors.username && (
                        <p className="error-msg">{`${errors.username.message}`}</p>
                    )}
                    <Input {...register("email")} placeholder="email" />
                    {errors.email && (
                        <p className="error-msg">{`${errors.email.message}`}</p>
                    )}

                    <DateOfBirthSelect
                        signUpRegister={register}
                        signUpSetValues={setValue}
                        errors={errors}
                    />

                    <Input {...register("password")} type="password" placeholder="password" />
                    {errors.password && (
                        <p className="error-msg">{`${errors.password.message}`}</p>
                    )}
                    <Input {...register("confirmPassword")} type="password" placeholder="confirm password" />
                    {errors.confirmPassword && (
                        <p className="error-msg">{`${errors.confirmPassword.message}`}</p>
                    )}

                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing up
                        </Button>
                        : <Button className='bg-primary font-bold'>Sign up</Button>
                    }
                </form>
                <p>Already have an account? <Link href='/login' className='font-bold hover:text-primary'>Log in</Link></p>
            </div>
        </div>
    )
}