'use client';
import { Button } from "@/components/ui/button";
import TweetlyLogoWhite from '@public/white.png';
import TweetlyLogoBlack from '@public/black.png';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTemporaryUserPassword } from '@/actions/actions';
import { z } from 'zod';
import { getErrorMessage } from '@/lib/utils';
import Image from 'next/image';
import { useDisplayContext } from '@/context/DisplayContextProvider';
import { FormTemporaryUserProfilePictureType, isZodError, temporaryUserProfilePictureSchema } from 'tweetly-shared';
import { SignUpStepType } from '../SignUpProcess';
import Croppie, { CropType } from "croppie";
import "croppie/croppie.css";

const croppieProfileOptions = {
    showZoomer: true,
    enableOrientation: true,
    mouseWheelZoom: true,
    viewport: {
        width: 450,
        height: 450,
        type: "square" as CropType
    },
    boundary: {
        width: 500,
        height: 500
    }
};

type CroppieInstance = Croppie | null;

export default function SignUpStepFour({ dialogOpen, setDialogOpen, registrationStep, setRegistrationStep, hasCameBack, setHasCameBack, customError, setCustomError }: SignUpStepType) {
    const { savedTheme } = useDisplayContext();
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>('https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png');
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const profileInputRef = useRef<HTMLInputElement | null>(null);
    const croppieContainerRef = useRef<HTMLDivElement | null>(null);
    const croppieRef = useRef<CroppieInstance>(null);

    const formId = useId();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
    } = useForm<FormTemporaryUserProfilePictureType>({ resolver: zodResolver(temporaryUserProfilePictureSchema) });

    const onSubmit = async (formData: FormTemporaryUserProfilePictureType) => {
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
                        setError(detail.path[0] as keyof FormTemporaryUserProfilePictureType, {
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

    // CROPPIE
    const initializeCroppie = (): Croppie => {
        if (!croppieRef.current && croppieContainerRef.current) {
            croppieRef.current = new Croppie(croppieContainerRef.current, croppieProfileOptions);
        }
        return croppieRef.current!;
    };

    const onResult = (): void => {
        const croppieInstance = croppieRef.current as Croppie;
        croppieInstance.result({ type: "base64" }).then((base64: string) => {
            croppieRef.current?.destroy();
            croppieRef.current = null;
            setIsFileUploaded(() => false);
            setProfilePicturePreview(base64);
            setProfilePicture(new File([base64], 'profile picture'));
        });
    };

    const onFileUpload = () => {
        const file = profileInputRef.current?.files?.[0];
        if (!file) return;

        setIsFileUploaded(true);
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            const croppieInstance = initializeCroppie();
            croppieInstance.bind({ url: reader.result as string });
        };
        reader.onerror = (error) => {
            console.error("Error reading file: ", error);
        };
    };

    const handleSelectedImage = async (file: File) => {
        const fileType = file.type;
        const allowedFileTypes = ['image/jpg', 'image/jpeg', 'image/png'];

        if (!allowedFileTypes.includes(fileType)) {
            setError('profilePicture', {
                type: 'manual',
                message: 'File types allowed: png, jpg, jpeg'
            });
            return;
        }

        onFileUpload();
    };

    useEffect(() => {
        // Cleanup Croppie instance on component unmount
        return () => {
            if (croppieRef.current) {
                croppieRef.current.destroy();
                croppieRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (registrationStep === 4) {
            reset();
        }
    }, [registrationStep, reset]);

    return (
        <Dialog open={dialogOpen} >
            {!isFileUploaded
                ? (
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

                        <div className='flex flex-col gap-8 mb-auto mt-10 h-full'>
                            <div className='mr-auto'>
                                {hasCameBack && (
                                    <p className='text-secondary-text mb-2'>Welcome back, continue where you left of</p>
                                )}
                                <DialogTitle className='text-primary-text text-[2.15rem]'>Pick a profile picture</DialogTitle>
                                <p className='text-secondary-text'>Have a favorite selfie? Share with others</p>
                            </div>

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className='w-full h-full flex-center'
                                id={formId}
                            >
                                <div className={`relative w-[200px] h-[200px] flex justify-center rounded-full mb-auto border-4 ${savedTheme === 0 ? 'border-black-1' : 'border-white-1'}`} >
                                    <Image
                                        src={profilePicturePreview}
                                        alt='User profile picture'
                                        height={200} width={200}
                                        className={`rounded-full w-full h-full`} />

                                    <button className='absolute w-[50px] h-[50px] top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-10 flex-center bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                        onClick={() => profileInputRef.current?.click()}>
                                        <ImagePlus size={20} className='text-white-1' />
                                    </button>

                                    <input
                                        ref={profileInputRef}
                                        type="file"
                                        accept=".png, .jpg, .jpeg"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleSelectedImage(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    {errors.profilePicture && <p>{errors.profilePicture.message}</p>}
                                </div>

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
                                >
                                    {profilePicture ? 'Next' : 'Skip for now'}
                                </Button>
                            )
                        }

                    </DialogContent>
                )
                : (
                    <DialogContent
                        className='w-[90%] sm:w-[700px] sm:h-[75%] flex flex-col justify-center items-center py-5 bg-primary-foreground'
                        hideClose
                    >
                        <div className='h-fit flex gap-6 px-2 mr-auto mb-4'>
                            <button onClick={() => setIsFileUploaded(false)}>
                                <ArrowLeft size={22} />
                            </button>
                            <h1 className='text-20 font-bold'>Edit media</h1>
                        </div>
                        <div ref={croppieContainerRef}></div>
                        <Button type="button"
                            className='ml-auto mr-auto font-bold w-fit rounded-3xl text-white-1'
                            onClick={onResult}
                        >
                            Apply
                        </Button>
                    </DialogContent>
                )
            }
        </Dialog>
    )
}

