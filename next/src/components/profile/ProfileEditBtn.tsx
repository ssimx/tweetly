'use client';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from "../ui/button";
import { Loader2, ImagePlus, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Croppie, { CropType } from "croppie";
import "croppie/croppie.css";
import { getErrorMessage, isZodError, UserDataType, userUpdateProfileSchema, UserUpdateProfileType } from 'tweetly-shared';
import { updateProfile } from '@/actions/actions';
import { z } from 'zod';
import { useUserContext } from '@/context/UserContextProvider';
import { useMediaQuery } from 'usehooks-ts';

type CroppieInstance = Croppie | null;

export default function ProfileEditBtn({ profileInfo }: { profileInfo: Pick<UserDataType, 'profile'>['profile'] }) {
    const { refetchUserData } = useUserContext();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState(profileInfo.name);
    const [bio, setBio] = useState(profileInfo.bio);
    const [location, setLocation] = useState(profileInfo.location);
    const [website, setWebsite] = useState(profileInfo.websiteUrl);
    const [customError, setCustomError] = useState<string | null>(null);
    const formId = useId();

    const defaultProfilePictureLink = 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png';

    const [uploadedProfilePictureData, setUploadedProfilePictureData] = useState<File | null>(null);
    // If picture is selected and applied, display it to the user
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>(profileInfo.profilePicture);
    // If picture is selected and in edit mode, change state to true, when returned/applied change it back to false
    const [uploadedBannerPictureData, setUploadedBannerPictureData] = useState<File | null>(null);
    // If picture is selected and applied, display it to the user
    const [bannerPicturePreview, setBannerPicturePreview] = useState<string>(profileInfo.bannerPicture);
    // If picture is selected and in edit mode, change state to true, when returned/applied change it back to false
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    const [pictureType, setPictureType] = useState<'profile' | 'banner' | undefined>(undefined);
    const bannerPictureInputRef = useRef<HTMLInputElement | null>(null);
    const profilePictureInputRef = useRef<HTMLInputElement | null>(null);
    const croppieContainerRef = useRef<HTMLDivElement | null>(null);
    const croppieRef = useRef<CroppieInstance>(null);
    const router = useRouter();

    // LOGIC FOR ENABLING/DISABLING SAVE BUTTON -------------------------------------------------------------------------------------

    const maxNameChars = 50;
    const maxBioChars = 160;
    const maxLocationChars = 30;
    const maxWebsiteChars = 100;

    const changedName = name !== profileInfo.name ? name.length < maxNameChars : false;
    const changedBio = bio !== profileInfo.bio ? bio.length < maxBioChars : false;
    const changedLocation = location !== profileInfo.location ? location.length < maxLocationChars : false;
    const changedWebsite = website !== profileInfo.websiteUrl ? website.length < maxWebsiteChars : false;

    const changedBannerPicture = uploadedBannerPictureData === null
        ? bannerPicturePreview !== profileInfo.bannerPicture
            ? true
            : false
        : true

    const changedProfilePicture = uploadedProfilePictureData === null
        ? profilePicturePreview !== profileInfo.profilePicture
            ? true
            : false
        : true

    const buttonEnabled =
        changedName || changedBio || changedLocation || changedWebsite || changedBannerPicture || changedProfilePicture || false;

    // ------------------------------------------------------------------------------------------------------------------------------

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<UserUpdateProfileType>({ resolver: zodResolver(userUpdateProfileSchema) });

    const { ref: profilePictureRef, ...profilePictureRest } = register('profilePicture');
    const { ref: bannerPictureRef, ...bannerPictureRest } = register('bannerPicture');

    const onSubmit = async (formData: UserUpdateProfileType) => {
        if (isSubmitting) return;
        setCustomError(null);

        try {
            const response = await updateProfile(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else throw response.error;
            }

            // if success, redirect
            router.refresh();
            setDialogOpen(false);
            refetchUserData();
        } catch (error: unknown) {
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof UserUpdateProfileType, {
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

            setUploadedBannerPictureData(null);
            setUploadedProfilePictureData(null);
            setProfilePicturePreview(profileInfo.profilePicture);
            setBannerPicturePreview(profileInfo.bannerPicture);
        }
    };

    const handleRemoveBannerPicture = async () => {
        setBannerPicturePreview('');
        setUploadedBannerPictureData(null);
        setValue('removeBannerPicture', true);
    };

    const handleRemoveProfilePicture = async () => {
        setProfilePicturePreview(defaultProfilePictureLink);
        setUploadedProfilePictureData(null);
        setValue('removeProfilePicture', true);
    };

    const phoneSmallestViewport = useMediaQuery('(min-width: 375px');
    const phoneSmallViewport = useMediaQuery('(min-width: 390px)');
    const phoneBigViewport = useMediaQuery('(min-width: 400px)');
    const phoneBiggerViewport = useMediaQuery('(min-width: 450px)');
    const smViewport = useMediaQuery('(min-width: 640px)');
    const mdViewport = useMediaQuery('(min-width: 768px)');

    // CROPPIE
    const croppieProfileOptions = {
        showZoomer: true,
        enableOrientation: true,
        mouseWheelZoom: true,
        viewport: {
            width: mdViewport === true || smViewport === true
                    ? 500 * 0.8
                    : phoneBiggerViewport === true
                        ? 450 * 0.8
                        : phoneBigViewport === true
                            ? 400 * 0.8
                            : phoneSmallViewport === true
                                ? 390 * 0.8
                                : phoneSmallestViewport === true
                                    ? 375 * 0.8
                                    : 300,
            height: mdViewport === true || smViewport === true
                    ? 500 * 0.8
                    : phoneBiggerViewport === true
                        ? 450 * 0.8
                        : phoneBigViewport === true
                            ? 400 * 0.8
                            : phoneSmallViewport === true
                                ? 390 * 0.8
                                : phoneSmallestViewport === true
                                    ? 375 * 0.8
                                    : 300,
            type: "circle" as CropType
        },
    };

    const croppieBannerOptions = {
        showZoomer: true,
        enableOrientation: true,
        mouseWheelZoom: true,
        viewport: {
            width: mdViewport === true || smViewport === true
                    ? 500 * 0.8
                    : phoneBiggerViewport === true
                        ? 450 * 0.8
                        : phoneBigViewport === true
                            ? 400 * 0.8
                            : phoneSmallViewport === true
                                ? 390 * 0.8
                                : phoneSmallestViewport === true
                                    ? 375 * 0.8
                                    : 300,
            height: mdViewport === true || smViewport === true
                    ? 225 * 0.8
                    : phoneBiggerViewport === true
                        ? 200 * 0.8
                        : phoneBigViewport === true
                            ? 175 * 0.8
                            : phoneSmallViewport === true
                                ? 170 * 0.8
                                : phoneSmallestViewport === true
                                    ? 165 * 0.8
                                    : 150,
            type: "square" as CropType
        },
    };

    const initializeCroppie = (type: 'profile' | 'banner'): Croppie => {
        if (!croppieRef.current && croppieContainerRef.current) {
            croppieRef.current = new Croppie(croppieContainerRef.current, type === 'profile' ? croppieProfileOptions : croppieBannerOptions);
        }
        return croppieRef.current!;
    };

    const onResult = (): void => {
        const croppieInstance = croppieRef.current as Croppie;
        croppieInstance.result({ type: "base64" }).then((base64: string) => {
            croppieRef.current?.destroy();
            croppieRef.current = null;
            setCustomError(null);
            setIsFileUploaded(() => false);

            if (pictureType === 'profile') {
                setProfilePicturePreview(base64);
                setValue('profilePicture', new File([base64], 'profile picture', { type: uploadedProfilePictureData!.type }));
                setUploadedProfilePictureData(new File([base64], 'profile picture', { type: uploadedProfilePictureData!.type }));
                setValue('removeProfilePicture', false);
            } else {
                setBannerPicturePreview(base64);
                setValue('bannerPicture', new File([base64], 'banner picture', { type: uploadedBannerPictureData!.type }));
                setUploadedBannerPictureData(new File([base64], 'banner picture', { type: uploadedBannerPictureData!.type }));
                setValue('removeBannerPicture', false);
            }
        });
    };

    const onFileUpload = (type: 'profile' | 'banner') => {
        const file = profilePictureInputRef.current?.files?.[0] || bannerPictureInputRef.current?.files?.[0];
        if (!file) return;

        setIsFileUploaded(true);
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            type === 'profile'
                ? setUploadedProfilePictureData(new File([reader.result as string], 'profile picture', { type: file.type }))
                : setUploadedBannerPictureData(new File([reader.result as string], 'banner picture', { type: file.type }));
            const croppieInstance = initializeCroppie(type);
            croppieInstance.bind({ url: reader.result as string });
        };
        reader.onerror = (error) => {
            console.error("Error reading file: ", error);
        };
    };

    const handleSelectedImage = async (file: File, type: 'banner' | 'profile') => {
        const fileType = file.type;
        const allowedFileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

        if (!allowedFileTypes.includes(fileType)) {
            setError('bannerPicture', {
                type: 'manual',
                message: 'Only .jpg, .jpeg, .png and .webp formats are supported'
            });
            return;
        }

        setPictureType(() => type);
        onFileUpload(type);
    };

    useEffect(() => {
        // Track change in viewport (window resize)
        // and reset the croppie by removing the uploaded picture
        setIsFileUploaded(false);
    }, [smViewport, mdViewport]);

    useEffect(() => {
        // Cleanup Croppie instance when edit media is cancelled
        if (!isFileUploaded && croppieRef.current) {
            croppieRef.current.destroy();
            croppieRef.current = null;
        }
    }, [isFileUploaded]);

    useEffect(() => {
        // Cleanup Croppie instance on component unmount
        return () => {
            if (croppieRef.current) {
                croppieRef.current.destroy();
                croppieRef.current = null;
            }
        };
    }, []);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className='w-fit h-fit py-1 px-4 rounded-[25px] border border-primary-border font-semibold hover:bg-post-hover'>
                Edit profile
            </DialogTrigger>
            {!isFileUploaded
                ? (
                    <DialogContent
                        className="w-[90%] max-h-[90dvh] flex flex-col gap-2 px-[2em] z-[9999] overflow-y-auto"
                        hideClose
                    >
                        <div className="flex justify-between">
                            <DialogTitle className="h-[35px] text-20 font-bold">Edit profile</DialogTitle>
                            <button
                                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                onClick={() => setDialogOpen(false)}
                            >
                                <X size={22} className="text-primary-text" />
                                <span className="sr-only">Close</span>
                            </button>
                        </div>

                        {/* Banner and Profile Picture Container */}
                        <div className="relative">
                            {/* Banner with Aspect Ratio */}
                            <div className="w-full h-[125px] xs:h-[150px] lg:h-[175px]">
                                <div className="h-full relative flex-center gap-2">
                                    {bannerPicturePreview !== "" ? (
                                        <>
                                            <Image
                                                src={bannerPicturePreview}
                                                alt="User banner picture"
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                            <button
                                                className="z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30 border"
                                                onClick={() => bannerPictureInputRef.current?.click()}
                                            >
                                                <ImagePlus size={20} className="text-primary-text-color-white" />
                                            </button>
                                            <button
                                                className="z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30"
                                                onClick={handleRemoveBannerPicture}
                                            >
                                                <X size={20} className="text-primary-text-color-white" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute top-0 left-0 w-full h-full bg-secondary-foreground"></div>
                                            <button
                                                className="z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30"
                                                onClick={() => bannerPictureInputRef.current?.click()}
                                            >
                                                <ImagePlus size={20} className="text-primary-text-color-white" />
                                            </button>
                                        </>
                                    )}
                                    <input
                                        suppressHydrationWarning
                                        {...bannerPictureRest} name="bannerPicture" ref={(e) => {
                                            bannerPictureRef(e);
                                            setValue('bannerPicture', uploadedBannerPictureData ?? undefined);
                                            bannerPictureInputRef.current = e;
                                        }}
                                        type="file"
                                        accept=".png, .jpg, .jpeg .webp"
                                        className="hidden"
                                        style={{ minWidth: '1500px', minHeight: '500px' }}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleSelectedImage(e.target.files[0], 'banner');
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Profile Picture */}
                            <div className="absolute bottom-0 left-5 translate-y-[50%] size-[100px] xs:size-[125px] md:size-[150px] rounded-full border-4 overflow-hidden border-[#ffffff]">
                                <div className="relative w-full h-full flex-center">
                                    {profilePicturePreview !== defaultProfilePictureLink ? (
                                        <>
                                            <Image
                                                src={profilePicturePreview}
                                                alt="User profile picture"
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                            <div className="w-full flex-center gap-2">
                                                <button
                                                    className="z-10 bg-black-1/30 p-2 xs:p-3 rounded-full hover:bg-black-1/50"
                                                    onClick={() => profilePictureInputRef.current?.click()}
                                                >
                                                    <ImagePlus size={16} className="size-[16px] xs:size-[20px] text-primary-text-color-white" />
                                                </button>
                                                <button
                                                    className="z-10 bg-black-1/30 p-2 xs:p-3 rounded-full hover:bg-black-1/50"
                                                    onClick={handleRemoveProfilePicture}
                                                >
                                                    <X size={16} className="size-[16px] xs:size-[20px] text-primary-text-color-white" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Image
                                                src={profilePicturePreview}
                                                alt="User profile picture"
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                            <button
                                                className="z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30"
                                                onClick={() => profilePictureInputRef.current?.click()}
                                            >
                                                <ImagePlus size={16} className="size-[16px] xs:size-[20px] text-primary-text-color-white" />
                                            </button>
                                        </>
                                    )}
                                    <input
                                        suppressHydrationWarning
                                        {...profilePictureRest} name="profilePicture" ref={(e) => {
                                            profilePictureRef(e);
                                            setValue('profilePicture', uploadedProfilePictureData ?? undefined);
                                            profilePictureInputRef.current = e;
                                        }}
                                        type="file"
                                        accept=".png, .jpg, .jpeg .webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleSelectedImage(e.target.files[0], 'profile');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form
                            suppressHydrationWarning
                            onSubmit={handleSubmit(onSubmit)}
                            id={formId}
                            className="flex flex-col gap-4 mt-[75px]"
                        >
                            <div className="flex flex-col">
                                {errors.bannerPicture && (
                                    <p className="!mt-2 error-msg">Banner picture: {errors.bannerPicture.message}</p>
                                )}
                                {errors.profilePicture && (
                                    <p className="!mt-2 error-msg">Profile picture: {errors.profilePicture.message}</p>
                                )}
                            </div>
                            <div className="w-full flex flex-col border border-primary-border rounded-md px-2 py-1">
                                <label className="flex justify-between text-14 text-secondary-text">
                                    <p>Name</p>
                                    <p className={`${name.length === maxNameChars ? "text-red-500" : null}`}>{`${name.length} / ${maxNameChars}`}</p>
                                </label>
                                <TextareaAutosize
                                    suppressHydrationWarning
                                    maxLength={maxNameChars}
                                    {...register("name")}
                                    className="h-[200px] sm:h-[175px] w-full resize-none mt-2 outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-center text-red-600 font-bold text-xs">{`${errors.name.message}`}</p>
                                )}
                            </div>
                            <div className='w-full flex flex-col border border-primary-border rounded-md px-2 py-1'>
                                <label className='flex justify-between text-14 text-secondary-text'>
                                    <p>Bio</p>
                                    <p className={`${bio.length === maxBioChars ? 'text-red-500' : null}`}>{`${bio.length} / ${maxBioChars}`}</p>
                                </label>
                                <TextareaAutosize
                                    suppressHydrationWarning
                                    maxLength={maxBioChars}
                                    className='h-[200px] sm:h-[175px] w-full resize-none mt-2 outline-none'
                                    placeholder='Your biography...'
                                    {...register("bio")}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                            <div className='w-full flex flex-col border border-primary-border rounded-md px-2 py-1'>
                                <label className='flex justify-between text-14 text-secondary-text'>
                                    <p>Location</p>
                                    <p className={`${location.length === maxLocationChars ? 'text-red-500' : null}`}>{`${location.length} / ${maxLocationChars}`}</p>
                                </label>
                                <TextareaAutosize
                                    suppressHydrationWarning
                                    maxLength={maxLocationChars}
                                    {...register('location')}
                                    className='h-[200px] sm:h-[175px] w-full resize-none mt-2 outline-none'
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)} />
                                {errors.location && (
                                    <p className="text-center text-red-600 font-bold text-xs">{`${errors.location.message}`}</p>
                                )}
                            </div>
                            <div className='w-full flex flex-col border border-primary-border rounded-md px-2 py-1'>
                                <label className='flex justify-between text-14 text-secondary-text'>
                                    <p>Website</p>
                                    <p className={`${website.length === maxWebsiteChars ? 'text-red-500' : null}`}>{`${website.length} / ${maxWebsiteChars}`}</p>
                                </label>
                                <TextareaAutosize
                                    suppressHydrationWarning
                                    maxLength={maxWebsiteChars}
                                    {...register('website')}
                                    className='h-[200px] sm:h-[175px] w-full resize-none mt-2 outline-none'
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)} />
                                {errors.website && (
                                    <p className="text-center text-red-600 font-bold text-xs">{`${errors.website.message}`}</p>
                                )}
                            </div>
                        </form>

                        <DialogFooter>
                            {customError && (
                                <p className='!my-auto error-msg'>{customError}</p>
                            )}

                            <Button
                                form={formId}
                                className='ml-auto font-bold w-fit rounded-3xl text-primary-text-color-white'
                                disabled={isSubmitting || !buttonEnabled}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>

                        </DialogFooter>
                    </DialogContent>
                )
                : (
                    <DialogContent
                        className='w-[90%] min-h-[500px] h-[80svh] max-h-[900px] z-[9999]
                            flex flex-col justify-between items-center bg-primary-foreground 
                            sm:w-[550px] sm:px-[2em]
                            md:w-[700px]'
                        hideClose
                    >
                        <div className='w-full'>
                            <div className='h-fit flex gap-6 px-2 mr-auto mb-auto'>
                                <button
                                    onClick={() => {
                                        setUploadedBannerPictureData(null);
                                        setUploadedProfilePictureData(null);
                                        setIsFileUploaded(false);
                                    }}
                                >
                                    <ArrowLeft size={22} />
                                </button>
                                <DialogTitle className='text-20 font-bold'>Edit profile</DialogTitle>
                            </div>

                            <button
                                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                onClick={() => {
                                    setUploadedBannerPictureData(null);
                                    setUploadedProfilePictureData(null);
                                    setIsFileUploaded(false);
                                    setDialogOpen(false);
                                }}
                            >
                                <X size={22} className='text-primary-text' />
                                <span className="sr-only">Close</span>
                            </button>
                        </div>

                        <div className='w-[85vw] h-[85vw] sm:w-[500px] sm:h-[500px]'>
                            <div ref={croppieContainerRef}></div>
                        </div>
                        
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
