'use client';

import { logInSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof logInSchema>;

export default function LogIn() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(logInSchema) });

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData);
            }

            const result: { token: string } = await response.json();
            Cookies.set('token', result.token, { expires: 30 });
            console.log('Login successful', result);
            
            router.push('/');
        } catch (error) {
            console.error('Error: ', error);
            reset();
        }
    };

    return (
        <div>
            <h1>
                Happening now
            </h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Username</label>
                <input {...register("username")} />
                {errors.username && (
                    <p>{`${errors.username.message}`}</p>
                )}
                <label>Password</label>
                <input {...register("password")} type="password" />
                {errors.password && (
                    <p>{`${errors.password.message}`}</p>
                )}
                <button disabled={isSubmitting}>
                    Log In
                </button>
            </form>
        </div>
    )
}