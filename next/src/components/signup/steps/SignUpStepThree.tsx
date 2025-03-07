'use client';
import { Button } from "@/components/ui/button";
import TweetlyLogoWhite from '@public/white.png';
import TweetlyLogoBlack from '@public/black.png';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, X, AtSign, CircleCheck, CircleX } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '@/components/ui/input';
import { checkIfUsernameIsAvailable, updateTemporaryUserUsername } from '@/actions/actions';
import { z } from 'zod';
import Image from 'next/image';
import { useDisplayContext } from '@/context/DisplayContextProvider';
import { AppError, FormTemporaryUserUsernameType, getErrorMessage, isZodError, SuccessResponse, temporaryUserUsernameSchema, usernameSchema } from 'tweetly-shared';
import { SignUpStepType } from '../SignUpProcess';
import { debounce } from 'lodash';

export default function SignUpStepThree({ dialogOpen, setDialogOpen, setRegistrationStep, customError, setCustomError }: SignUpStepType) {
    const { savedTheme } = useDisplayContext();
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const formId = useId();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
    } = useForm<FormTemporaryUserUsernameType>({ resolver: zodResolver(temporaryUserUsernameSchema) });

    const usernameWatch = useWatch({ control, name: 'username', defaultValue: '' });

    // Create a debounced function for checking username availability
    const checkUsernameAvailability = useCallback(
        (username: string) => {
            const debouncedCheck = debounce(async (usernameToCheck: string) => {
                if (!usernameToCheck) {
                    return;
                }

                setIsChecking(true);
                setIsAvailable(null);
                setCustomError(null);

                try {
                    usernameSchema.parse({ username: usernameToCheck.trim() });
                    const encodedUsername = encodeURIComponent(usernameToCheck.trim());
                    const response = await checkIfUsernameIsAvailable({ username: encodedUsername });

                    if (!response.success) {
                        if (response.error.details) throw new z.ZodError(response.error.details);
                        else throw new Error(response.error.message);
                    }

                    const { data } = response as SuccessResponse<{ available: boolean }>;
                    if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                    else if (data.available === undefined) throw new AppError('Available property is missing in data response', 404, 'MISSING_PROPERTY');

                    setIsAvailable(data.available);
                } catch (error: unknown) {
                    if (isZodError(error)) {
                        error.issues.forEach((detail) => {
                            if (detail.path && detail.message) {
                                setError(detail.path[0] as keyof FormTemporaryUserUsernameType, {
                                    type: 'manual',
                                    message: detail.message
                                });
                            }
                        });
                    } else {
                        const errorMessage = getErrorMessage(error);
                        console.error('Error:', errorMessage);
                        setCustomError(errorMessage ?? 'Something went wrong, refresh the page or remove cookies. If problem persists, contact the support');
                    }
                } finally {
                    setIsChecking(false);
                }
            }, 500);

            debouncedCheck(username);
            return debouncedCheck;
        },
        [setCustomError, setError]
    );

    // Call the debounced function when username changes
    useEffect(() => {
        setIsAvailable(null);

        // For cancel method
        let debouncedCheckFn: ReturnType<typeof debounce> | null = null;

        if (usernameWatch && !isSubmitting) {
            debouncedCheckFn = checkUsernameAvailability(usernameWatch);
        }

        // Cleanup debounced function on unmount or when dependencies change
        return () => {
            if (debouncedCheckFn) {
                debouncedCheckFn.cancel();
            }
        };
    }, [usernameWatch, isSubmitting, checkUsernameAvailability]);

    const onSubmit = async (formData: FormTemporaryUserUsernameType) => {
        if (isSubmitting || isChecking) return;
        setCustomError(null);

        try {
            const response = await updateTemporaryUserUsername(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'NOT_LOGGED_IN') {
                    setCustomError('Not logged in, please log in with existing email or register a new account');
                    setRegistrationStep(() => 0);
                    reset();
                    return;
                } else if (response.error.code === 'USERNAME_TAKEN') {
                    setCustomError('Username is already taken');
                    return;
                }
                else throw new Error(response.error.message);
            }

            setRegistrationStep(() => 4);
        } catch (error: unknown) {
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof FormTemporaryUserUsernameType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                console.error('Registration error:', errorMessage);
                setCustomError(errorMessage ?? 'Something went wrong, refresh the page or remove cookies. If problem persists, contact the support');
            }

        }
    };

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
                        <DialogTitle className='text-primary-text text-[2.15rem]'>What should we call you?</DialogTitle>
                        <p className='text-secondary-text'>Your <span className='text-primary'>@username</span> is unique. You can always change it later</p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-5 w-full'
                        id={formId}
                    >
                        <div className="relative h-10 w-full">
                            <AtSign size={16} className="absolute left-0 ml-2 top-1/2 transform -translate-y-1/2 text-primary z-10" />
                            <Input
                                {...register("username")}
                                placeholder="username"
                                maxLength={15}
                                type='username'
                                className="pl-8 pr-3 py-2 text-md w-full rounded shadow-sm"
                            />

                            {isAvailable === true
                                && (
                                    <div title='Username is available'>
                                        <CircleCheck size={18} className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 text-green-400 z-10" />
                                    </div>
                                )
                            }

                            {isAvailable === false
                                && (
                                    <div title='Username is not available'>
                                        <CircleX size={18} className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 text-red-600 z-10" />
                                    </div>
                                )
                            }
                        </div>
                        {errors.username && (
                            <p className="error-msg">{`${errors.username.message}`}</p>
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
                            disabled={!isAvailable}
                        >
                            Next
                        </Button>
                    )
                }

            </DialogContent>
        </Dialog>
    )
}

