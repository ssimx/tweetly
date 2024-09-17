'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpSchema = z.object({
    username: z.string()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters"),
    email: z.string().email(),
    dateOfBirth: z.string().date(),
    password: z.string()
        .min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type SignUpProps = z.infer<typeof signUpSchema>;

const SignUp = () => {
    const { register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<SignUpProps>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpProps) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        reset();
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
                <label>Date Of Birth</label>
                <input {...register("dateOfBirth")} />
                <label>Password</label>
                <input {...register("password")} />
                <label>Confirm Password</label>
                <input {...register("confirmPassword")} />
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

export default SignUp;
