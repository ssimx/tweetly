'use client';
import { Button } from "@/components/ui/button";
import TweetlyLogoWhite from '@public/white.png';
import TweetlyLogoBlack from '@public/black.png';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import { useEffect, useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '@/components/ui/input';
import { updateTemporaryUserPassword } from '@/actions/actions';
import { z } from 'zod';
import { getErrorMessage } from '@/lib/utils';
import Image from 'next/image';
import { useDisplayContext } from '@/context/DisplayContextProvider';
import { FormTemporaryUserPasswordType, isZodError, temporaryUserPasswordSchema } from 'tweetly-shared';
import { SignUpStepType } from '../SignUpProcess';

export default function SignUpStepOne({ dialogOpen, setDialogOpen, registrationStep, setRegistrationStep, hasCameBack, setHasCameBack, customError, setCustomError }: SignUpStepType) {
    const { savedTheme } = useDisplayContext();
    const formId = useId();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
    } = useForm<FormTemporaryUserPasswordType>({ resolver: zodResolver(temporaryUserPasswordSchema) });

    const passwordWatch = useWatch({ control, name: 'password', defaultValue: '' });
    const confirmPasswordWatch = useWatch({ control, name: 'confirmPassword', defaultValue: '' });

    const onSubmit = async (formData: FormTemporaryUserPasswordType) => {
        if (isSubmitting) return;
        setCustomError(null);

        try {
            const response = await updateTemporaryUserPassword(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'NOT_LOGGED_IN') {
                    setCustomError('Not logged in, please log in with existing email or register a new account');
                    setHasCameBack!(false);
                    setRegistrationStep(() => 0);
                    reset();
                    return;
                }
                else throw new Error(response.error.message);
            }

            setHasCameBack!(false);
            setRegistrationStep(() => 2);
        } catch (error: unknown) {

            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    console.log(detail.path)
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof FormTemporaryUserPasswordType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                console.error('Registration error:', errorMessage);
                setCustomError(errorMessage ?? 'Something went wrong, refresh the page or remove cookies. If problem persists, contact the support');
                reset();
            }

        }
    };

    useEffect(() => {
        if (registrationStep === 1) {
            reset();
        }
    }, [registrationStep, reset]);

    return (
        <Dialog open={dialogOpen} >
            <DialogContent
                className='w-[90%] sm:w-[700px] sm:h-[75%] flex flex-col justify-center items-center px-20 py-5 bg-primary-foreground'
                hideClose
            >

                <div className=''>
                    <Image src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite} alt='Tweetly logo' width='30' height='30' className='mx-auto' />
                </div>

                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => setDialogOpen(false)}
                >
                    <X size={22} className='text-primary-text' />
                    <span className="sr-only">Close</span>
                </button>

                <div className='flex flex-col gap-8 mb-auto mt-10'>
                    <div className='mr-auto'>
                        {hasCameBack && (
                            <p className='text-secondary-text mb-2'>Welcome back, continue where you left of</p>
                        )}
                        <DialogTitle className='text-primary-text text-[2.15rem]'>You&apos;ll need a password</DialogTitle>
                        <p className='text-secondary-text ml-2'>Make sure it&apos;s 8 characters or more</p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-5 w-full'
                        id={formId}
                    >
                        <Input {...register("password")} placeholder="Password" maxLength={50} type='password' />
                        {errors.password && (
                            <p className="error-msg">{`${errors.password.message}`}</p>
                        )}

                        <Input {...register("confirmPassword")} placeholder="Confirm password" maxLength={254} type='password' />
                        {errors.confirmPassword && (
                            <p className="error-msg">{`${errors.confirmPassword.message}`}</p>
                        )}

                    </form>

                    {customError && (
                        <p className="error-msg text-center mt-auto">{`${customError}`}</p>
                    )}
                </div>

                {isSubmitting
                    ? (
                        <Button disabled
                            className='w-full h-[3rem] text-[1.1rem] bg-primary font-semibold text-white-1 mt-auto rounded-[25px]'>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </Button>
                    )
                    : (
                        <Button form={formId}
                            className='w-full h-[3rem] text-[1.1rem] bg-primary font-semibold text-white-1 mt-auto rounded-[25px]'
                            disabled={!(passwordWatch.length >= 8 && confirmPasswordWatch.length >= 8)}
                        >
                            Next
                        </Button>
                    )
                }

            </DialogContent>
        </Dialog>
    )
}

