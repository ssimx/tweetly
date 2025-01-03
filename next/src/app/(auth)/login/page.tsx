'use client';
import { logInSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Apple } from "lucide-react";

type FormData = z.infer<typeof logInSchema>;

export default function LogIn() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        resetField,
    } = useForm<FormData>({ resolver: zodResolver(logInSchema) });

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/auth/login', {
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
                if (error.message === 'User not found') {
                    setError("username", { type: "manual", message: error.message });
                } else if (error.message === 'Incorrect password') {
                    setError("password", { type: "manual", message: error.message });
                    resetField("password", { keepError: true });
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
                Sign in to Tweetly
            </h1>
            <div className='flex flex-col justify-between items-center gap-8'>
                <div className='flex flex-col gap-4 w-3/5'>
                    <Button className='social-media-connect-btn'>
                        <Mail className="mr-2 h-4 w-4" /> Sign in with Email
                    </Button>
                    <Button className='social-media-connect-btn'>
                        <Apple className="mr-2 h-4 w-4" /> Sign in with Apple
                    </Button>
                </div>

                <p>Or</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <Input {...register("username")} placeholder="username" />
                    {errors.username && (
                        <p className="error-msg">{`${errors.username.message}`}</p>
                    )}
                    <Input {...register("password")} type="password" placeholder="password" />
                    {errors.password && (
                        <p className="error-msg">{`${errors.password.message}`}</p>
                    )}
                    {isSubmitting
                        ? <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in
                        </Button>
                        : <Button className='bg-primary font-bold'>Log in</Button>
                    }
                </form>
                <p>Don&apos;t have an account? <Link href='/signup' className='font-bold hover:text-primary'>Sign up</Link></p>
            </div>
        </div>
    )
}