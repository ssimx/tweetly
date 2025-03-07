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
import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormTemporaryUserBasicDataType, getErrorMessage, isZodError, SuccessResponse, temporaryUserBasicDataSchema } from 'tweetly-shared';
import { Input } from '@/components/ui/input';
import { DateOfBirthSelect } from '@/components/forms/DateOfBirthSelect';
import Image from 'next/image';
import { useDisplayContext } from '@/context/DisplayContextProvider';
import { SignUpStepType } from '../SignUpProcess';
import { checkIfEmailIsAvailable } from '@/actions/actions';
import { z } from 'zod';

type SignUpStepZeroProps = SignUpStepType & {
    setBasicUserInfo: NonNullable<SignUpStepType['setBasicUserInfo']>;
};

export default function SignUpStepZero({ dialogOpen, setDialogOpen, setRegistrationStep, customError, setCustomError, basicUserInfo, setBasicUserInfo }: SignUpStepZeroProps) {
    const { savedTheme } = useDisplayContext();
    const formId = useId();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<FormTemporaryUserBasicDataType>({
        resolver: zodResolver(temporaryUserBasicDataSchema),
        defaultValues: { profileName: basicUserInfo?.profileName, email: basicUserInfo?.email }
    });

    // React hook form's watch API is causing performance issue
    const [profileNameWatch, setProfileNameWatch] = useState(basicUserInfo?.profileName ?? '');
    const [emailWatch, setEmailWatch] = useState(basicUserInfo?.email ?? '');

    const yearWatch = useWatch({ control, name: 'year' });
    const monthWatch = useWatch({ control, name: 'month' });
    const dayWatch = useWatch({ control, name: 'day' });

    const onSubmit = async (formData: FormTemporaryUserBasicDataType) => {
        if (isSubmitting) return;
        setCustomError(null);

        try {
            const validatedData = temporaryUserBasicDataSchema.parse(formData);

            const response = await checkIfEmailIsAvailable({ email: validatedData.email });

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else throw new Error(response.error.message);
            }

            const { data } = response as SuccessResponse<{ available: boolean }>;
            if (!data) throw new Error('Data is missing in response');
            else if (data.available === undefined) throw new Error('Available property is missing in data response');

            if (data.available === false) {
                setError('email' as keyof FormTemporaryUserBasicDataType, {
                    type: 'manual',
                    message: 'Provided email address is not available'
                });
                return;
            }

            setBasicUserInfo({ ...formData });
            setCustomError(null);
            setRegistrationStep(() => 1);
        } catch (error: unknown) {
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    console.log(detail)
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof FormTemporaryUserBasicDataType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                console.error('Registration error:', errorMessage);
                setCustomError('Something went wrong');
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

                <div className='flex flex-col gap-8 mt-auto'>
                    <DialogTitle className='text-primary-text mr-auto text-[2.2rem]'>Create your account</DialogTitle>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-5 w-full'
                        id={formId}
                    >
                        <Input
                            {...register('profileName')}
                            placeholder="Name"
                            maxLength={50}
                            onChange={(e) => setProfileNameWatch(e.target.value)}
                        />
                        {errors.profileName && (
                            <p className="error-msg">{`${errors.profileName.message}`}</p>
                        )}

                        <Input
                            {...register('email')}
                            placeholder="Email"
                            maxLength={254}
                            onChange={(e) => setEmailWatch(e.target.value)}
                        />
                        {errors.email && (
                            <p className="error-msg">{`${errors.email.message}`}</p>
                        )}

                        <DateOfBirthSelect
                            signUpRegister={register}
                            signUpSetValues={setValue}
                            errors={errors}
                        />
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
                            disabled={!(profileNameWatch.length >= 2 && (emailWatch.includes('@') && emailWatch.includes('.')) && yearWatch && monthWatch && dayWatch)}
                        >
                            Next
                        </Button>
                    )
                }

            </DialogContent>
        </Dialog>
    )
}

