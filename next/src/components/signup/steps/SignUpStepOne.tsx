'use client';
import { Button } from "@/components/ui/button";
import TweetlyLogoWhite from '@public/white.png';
import TweetlyLogoBlack from '@public/black.png';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '@/components/ui/input';
import { registerTemporaryUser } from '@/actions/actions';
import { z } from 'zod';
import Image from 'next/image';
import { useDisplayContext } from '@/context/DisplayContextProvider';
import { FormTemporaryUserBasicDataType, FormTemporaryUserPasswordType, getErrorMessage, isZodError, temporaryUserPasswordSchema } from 'tweetly-shared';
import { SignUpStepType } from '../SignUpProcess';

type SignUpStepOneProps = SignUpStepType & {
    // Step 1 inherits step 0 user basic data such as profile name, email and date of birth
    // this will be used alongside password to register a new temporary user
    basicUserInfo: FormTemporaryUserBasicDataType,
};

export default function SignUpStepOne({ dialogOpen, setDialogOpen, setRegistrationStep, customError, setCustomError, basicUserInfo }: SignUpStepOneProps) {
    const { savedTheme } = useDisplayContext();
    const [passwordType, setPasswordType] = useState<'password' | 'text'>('password');
    const [confirmPasswordType, setConfirmPasswordType] = useState<'password' | 'text'>('password');
    const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
    const formId = useId();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
    } = useForm<FormTemporaryUserPasswordType>({ resolver: zodResolver(temporaryUserPasswordSchema) });

    const [passwordWatch, setPasswordWatch] = useState('');
    const [confirmPasswordWatch, setConfirmPasswordWatch] = useState('');

    const onSubmit = useCallback(async (formData: FormTemporaryUserPasswordType) => {
        if (isSubmitting) return;
        setCustomError(null);

        try {
            temporaryUserPasswordSchema.parse(formData);

            const response = await registerTemporaryUser(basicUserInfo, formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'EMAIL_TAKEN') {
                    setCustomError(`Provided email address is not available`);
                    setRegistrationStep(() => 0);
                    reset();
                    return;
                }
                else throw new Error(response.error.message);
            }

            setRegistrationStep(() => 3);
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
                setRegistrationStep(() => 0);
                setCustomError(errorMessage ?? 'Something went wrong, refresh the page or remove cookies. If problem persists, contact the support');
                reset();
            }
        }
    }, [isSubmitting, basicUserInfo, reset, setRegistrationStep, setError, setCustomError]);

    useEffect(() => {
        // Prevent fast typing issue where confirmed password doesn't match the password on submission
        setIsSubmitButtonEnabled(false);
        let timeoutId: NodeJS.Timeout | null = null;

        if (passwordWatch.length >= 8 && confirmPasswordWatch.length >= 8 && passwordWatch === confirmPasswordWatch) {
            timeoutId = setTimeout(() => {
                setIsSubmitButtonEnabled(true);
            }, 300);
        }

        return (() => {
            timeoutId && clearTimeout(timeoutId);
        })
    }, [passwordWatch, confirmPasswordWatch]);

    return (
        <Dialog open={dialogOpen} >
            <DialogContent
                className='w-[90%] h-[60%] px-[2em] py-5 flex flex-col justify-center items-center bg-primary-foreground sm:h-[75%] sm:px-[5em]'
                hideClose
            >

                <Image
                    src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite}
                    alt='Tweetly logo'
                    width='30'
                    height='30'
                    className='mx-auto'
                />

                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => setDialogOpen(false)}
                    tabIndex={0}
                >
                    <X size={22} className='text-primary-text' />
                    <span className="sr-only">Close</span>
                </button>

                <div className='flex flex-col gap-8 mb-auto mt-10'>
                    <div className='mr-auto'>
                        <DialogTitle className='text-primary-text text-[2.15rem]'>You&apos;ll need a password</DialogTitle>
                        <p className='text-secondary-text ml-2'>Make sure it&apos;s 8 characters or more</p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-5 w-full'
                        id={formId}
                    >
                        <div className="relative h-10 w-full">
                            <Input
                                {...register('password', {
                                    onChange: (e) => setPasswordWatch(e.target.value)
                                })}
                                placeholder="Password"
                                maxLength={50}
                                type={passwordType}
                                autoFocus={true}
                                tabIndex={1}
                            />
                            <button
                                title={passwordType === 'password' ? 'Show password' : 'Hide password'}
                                type='button'
                                onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}
                                className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 text-secondary-text z-10"
                                tabIndex={3}
                            >
                                {passwordType === 'password' ? <EyeOff size={18} /> : <Eye size={18} className='text-primary' />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="error-msg">{`${errors.password.message}`}</p>
                        )}

                        <div className="relative h-10 w-full">
                            <Input
                                {...register('confirmPassword', {
                                    onChange: (e) => setConfirmPasswordWatch(e.target.value)
                                })}
                                placeholder="Confirm password"
                                maxLength={50}
                                type={confirmPasswordType}
                                tabIndex={2}
                            />
                            <button
                                title={confirmPasswordType === 'password' ? 'Show password' : 'Hide password'}
                                type='button'
                                onClick={() => setConfirmPasswordType(confirmPasswordType === 'password' ? 'text' : 'password')}
                                className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 text-secondary-text z-10"
                                tabIndex={4}
                            >
                                {confirmPasswordType === 'password' ? <EyeOff size={18} /> : <Eye size={18} className='text-primary' />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="error-msg">{`${errors.confirmPassword.message}`}</p>
                        )}

                    </form>

                    {customError && (
                        <p className="error-msg text-center mt-auto">{`${customError}`}</p>
                    )}
                </div>

                <Button form={formId}
                    className='w-full h-[3rem] text-[1.1rem] bg-primary font-semibold text-white-1 mt-auto rounded-[25px]'
                    disabled={isSubmitButtonEnabled || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        'Submit'
                    )}
                </Button>

            </DialogContent>
        </Dialog>
    )
}

