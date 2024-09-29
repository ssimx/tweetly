'use client';


import { signUpSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(signUpSchema) });

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/register', {
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

            <h2>Join today.</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Username</label>
                <input {...register("username")} />
                {errors.username && (
                    <p>{`${errors.username.message}`}</p>
                )}
                <label>Email</label>
                <input {...register("email")} />
                {errors.email && (
                    <p>{`${errors.email.message}`}</p>
                )}
                <label>Date Of Birth</label>
                <input {...register("dateOfBirth")} />
                {errors.dateOfBirth && (
                    <p>{`${errors.dateOfBirth.message}`}</p>
                )}
                <label>Password</label>
                <input {...register("password")} type="password" />
                {errors.password && (
                    <p>{`${errors.password.message}`}</p>
                )}
                <label>Confirm Password</label>
                <input {...register("confirmPassword")} type="password" />
                {errors.confirmPassword && (
                    <p>{`${errors.confirmPassword.message}`}</p>
                )}
                <button disabled={isSubmitting}>
                    Submit
                </button>
            </form>
        </div>
    )
}