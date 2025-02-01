'use client';
import { settingsPasswordSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import SettingsHeaderInfo from "./SettingsHeaderInfo";
import { getErrorMessage } from "@/lib/utils";

type FormData = z.infer<typeof settingsPasswordSchema>;

export default function SettingsLogin() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        resetField,
    } = useForm<FormData>({ resolver: zodResolver(settingsPasswordSchema) });

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/auth/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(getErrorMessage(errorData));
            }

            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Incorrect password') {
                    setError("password", { type: "manual", message: error.message });
                    resetField("password", { keepError: true });
                }
                else {
                    console.error(error);
                    reset();
                }
            } else {
                console.error(error);
                reset();
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
                        <Input {...register("password")} type="password" placeholder="password" className='bg-transparent' />
                        {errors.password && (
                            <p className="error-msg">{`${errors.password.message}`}</p>
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
