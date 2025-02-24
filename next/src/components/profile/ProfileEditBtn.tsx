'use client';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { updateProfileSchema } from "@/lib/schemas";
import { ProfileInfo } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from 'react-textarea-autosize';
import { z } from "zod";
import { Button } from "../ui/button";
import { Loader2, ImagePlus, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Croppie, { CropType } from "croppie";
import "croppie/croppie.css";

type ProfileInfoData = z.infer<typeof updateProfileSchema>;

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

const croppieBannerOptions = {
    showZoomer: true,
    enableOrientation: true,
    mouseWheelZoom: true,
    viewport: {
        width: 500,
        height: 200,
        type: "square" as CropType
    },
    boundary: {
        width: 500,
        height: 500
    }
};

type CroppieInstance = Croppie | null;

type AppState = {
    isFileUploaded: boolean;
    croppedImage: string | null;
};


export default function ProfileEditBtn({ user }: { user: ProfileInfo }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(user.profile.name);
    const [bio, setBio] = useState(user.profile.bio);
    const [location, setLocation] = useState(user.profile.location);
    const [website, setWebsite] = useState(user.profile.websiteUrl);
    const [newBannerPicture, setNewBannerPicture] = useState<File | string | null>(null);
    const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
    const [bannerPicturePreview, setBannerPicturePreview] = useState<string>(user.profile.bannerPicture);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>(user.profile.profilePicture);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const profileInputRef = useRef<HTMLInputElement | null>(null);
    const [isFileUploaded, setIsFileUploaded] = useState<AppState["isFileUploaded"]>(false);
    const croppieContainerRef = useRef<HTMLDivElement | null>(null);
    const croppieRef = useRef<CroppieInstance>(null);
    const [pictureType, setPictureType] = useState<'profile' | 'banner' | undefined>(undefined);
    const router = useRouter();

    const maxBioChars = 160;
    const maxNameChars = 50;
    const maxLocationChars = 30;
    const maxWebsiteChars = 100;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<ProfileInfoData>({ resolver: zodResolver(updateProfileSchema) });

    useEffect(() => {
        // Cleanup Croppie instance on component unmount
        return () => {
            if (croppieRef.current) {
                croppieRef.current.destroy();
                croppieRef.current = null;
            }
        };
    }, []);

    const updateProfile = async (data: ProfileInfoData) => {
        try {
            let bannerPicturePublicId = '';
            let profilePicturePublicId = '';

            if (newBannerPicture !== null || newProfilePicture !== null) {
                let bannerPictureData: FormData | undefined = undefined;
                let profilePictureData: FormData | undefined = undefined;
                let bannerPicturePromise: Promise<null> | Promise<Response> = Promise.resolve(null);
                let profilePicturePromise: Promise<null> | Promise<Response> = Promise.resolve(null);

                if (newBannerPicture !== null) {
                    if (newBannerPicture === '') {
                        data.bannerPicture = '';
                    } else {
                        bannerPictureData = new FormData();
                        bannerPictureData.append('file', new File([newBannerPicture], 'bannerPicture'));
                        bannerPictureData.append('upload_preset', 'bannerPicture');
                        bannerPicturePromise = fetch('https://api.cloudinary.com/v1_1/ddj6z1ptr/image/upload', {
                            method: 'POST',
                            body: bannerPictureData,
                        });
                    }
                }

                if (newProfilePicture !== null) {
                    profilePictureData = new FormData();
                    profilePictureData.append('file', new File([newProfilePicture], 'profilePicture'));
                    profilePictureData.append('upload_preset', 'profilePicture');
                    profilePicturePromise = fetch('https://api.cloudinary.com/v1_1/ddj6z1ptr/image/upload', {
                        method: 'POST',
                        body: profilePictureData,
                    });
                }

                const promises: Promise<Response | null>[] = [bannerPicturePromise, profilePicturePromise]
                const responses = await Promise.allSettled(promises);
                const [bannerUploadResult, profileUploadResult] = responses;

                if (bannerPictureData !== undefined) {
                    if (bannerUploadResult.status === 'fulfilled') {
                        const bannerResponse = await bannerUploadResult.value!.json();
                        if (!bannerResponse.secure_url) {
                            console.error('Banner image upload failed:', bannerResponse);
                            return;
                        }
                        data.bannerPicture = bannerResponse.secure_url;
                        bannerPicturePublicId = bannerResponse.public_id;
                    } else {
                        console.error('Banner image upload failed:', bannerUploadResult.reason);
                    }
                }

                if (profilePictureData !== undefined) {
                    if (profileUploadResult.status === 'fulfilled') {
                        const profileResponse = await profileUploadResult.value!.json();
                        if (!profileResponse.secure_url) {
                            console.error('Profile image upload failed:', profileResponse);
                            return;
                        }
                        data.profilePicture = profileResponse.secure_url;
                        profilePicturePublicId = profileResponse.public_id;
                    } else {
                        console.error('Profile image upload failed:', profileUploadResult.reason);
                    }
                }
            }

            const response = await fetch(`/api/users/updateProfile/${user.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: { ...data }, bannerPicturePublicId: bannerPicturePublicId, profilePicturePublicId: profilePicturePublicId }),
            })

            if (!response.ok) {
                throw new Error('Profile update failed');
            }

            router.refresh();
            setOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveBanner = async () => {
        setNewBannerPicture('');
        setBannerPicturePreview('');
    };

    // CROPPIE
    const initializeCroppie = (type: 'profile' | 'banner'): Croppie => {
        if (!croppieRef.current && croppieContainerRef.current) {
            croppieRef.current = new Croppie(croppieContainerRef.current, type === 'profile' ? croppieProfileOptions : croppieBannerOptions);
        }
        return croppieRef.current!;
    };

    const onFileUpload = (type: 'profile' | 'banner') => {
        const file = profileInputRef.current?.files?.[0] || bannerInputRef.current?.files?.[0];
        if (!file) return;

        setIsFileUploaded(true);
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            const croppieInstance = initializeCroppie(type);
            croppieInstance.bind({ url: reader.result as string });
        };
        reader.onerror = (error) => {
            console.error("Error reading file: ", error);
        };
    };

    const onResult = (): void => {
        const croppieInstance = croppieRef.current as Croppie;
        croppieInstance.result({ type: "base64" }).then((base64: string) => {
            croppieRef.current?.destroy();
            croppieRef.current = null;
            setIsFileUploaded(() => false);
            pictureType === 'profile' ? setProfilePicturePreview(base64) : setBannerPicturePreview(base64);
            pictureType === 'profile' ? setNewProfilePicture(new File([base64], 'profile picture')) : setNewBannerPicture(new File([base64], 'banner picture'));
        });
    };

    const handleSelectedImage = async (file: File, type: 'banner' | 'profile') => {
        const fileType = file.type;
        const allowedFileTypes = ['image/jpg', 'image/jpeg', 'image/png'];

        if (!allowedFileTypes.includes(fileType)) {
            setError('bannerPicture', {
                type: 'manual',
                message: 'File types allowed: png, jpg, jpeg'
            });
            return;
        }

        setPictureType(() => type);
        onFileUpload(type);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className='edit-profile-btn'>
                Edit profile
            </DialogTrigger>
            {!isFileUploaded
                ? <DialogContent className="edit-profile-dialog">
                    <div className='h-[35px] text-20 font-bold'>Edit profile</div>
                    <div className='picture-banner-container h-[180px]'>
                        <div className='w-full h-full'>
                            <div className='relative w-full h-full flex-center gap-2'>
                                {bannerPicturePreview !== ''
                                    ? (
                                        <>
                                            <Image
                                                src={bannerPicturePreview}
                                                alt='User banner picture'
                                                height={180} width={600}
                                                className='w-full h-full absolute' />
                                            <button className=' z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                                onClick={() => bannerInputRef.current?.click()}>
                                                <ImagePlus size={20} className='text-primary-text' />
                                            </button>
                                            <button className=' z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                                onClick={handleRemoveBanner}>
                                                <X size={20} className='text-primary-text' />
                                            </button>
                                        </>)
                                    : (
                                        <>
                                            <div className='w-full h-full absolute bg-secondary-foreground' ></div>
                                            <button className=' z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                                onClick={() => bannerInputRef.current?.click()}>
                                                <ImagePlus size={20} className='text-primary-text' />
                                            </button>
                                        </>)
                                }
                                <input
                                    ref={bannerInputRef}
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    className="hidden"
                                    style={{ minWidth: '1500px', minHeight: '500px' }}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleSelectedImage(e.target.files[0], 'banner');
                                        }
                                    }}
                                />
                                {errors.bannerPicture && <p>{errors.bannerPicture.message}</p>}
                            </div>
                        </div>
                        <div className='w-[100px] h-[100px] absolute bottom-0 left-5 translate-y-[50%] rounded-full border-4 overflow-hidden border-[#ffffff]'>
                            <div className='relative w-full h-full flex-center'>
                                <Image
                                    src={profilePicturePreview}
                                    alt='User profile picture'
                                    height={100} width={100}
                                    className='absolute top-0 left-0 z-0' />
                                <button className='z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                    onClick={() => profileInputRef.current?.click()}>
                                    <ImagePlus size={20} className='text-primary-text' />
                                </button>
                                <input
                                    ref={profileInputRef}
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleSelectedImage(e.target.files[0], 'profile');
                                        }
                                    }}
                                />
                                {errors.profilePicture && <p>{errors.profilePicture.message}</p>}
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(updateProfile)} id='editProfileForm' className='mt-[75px]'>
                        <div className='profile-bio-input'>
                            <label className='flex justify-between text-14 text-secondary-text'>
                                <p>Name</p>
                                <p className={`${name.length === maxNameChars ? 'text-red-500' : null}`}>{`${name.length} / ${maxNameChars}`}</p>
                            </label>
                            <TextareaAutosize
                                maxLength={maxNameChars}
                                {...register('name')}
                                className='profile-textarea'
                                value={name}
                                onChange={(e) => setName(e.target.value)} />
                            {errors.name && (
                                <p className="text-center text-red-600 font-bold text-xs">{`${errors.name.message}`}</p>
                            )}
                        </div>
                        <div className='profile-bio-input'>
                            <label className='flex justify-between text-14 text-secondary-text'>
                                <p>Bio</p>
                                <p className={`${bio.length === maxBioChars ? 'text-red-500' : null}`}>{`${bio.length} / ${maxBioChars}`}</p>
                            </label>
                            <TextareaAutosize
                                maxLength={maxBioChars}
                                className='profile-textarea'
                                placeholder='Your biography...'
                                {...register("bio")}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>
                        <div className='profile-bio-input'>
                            <label className='flex justify-between text-14 text-secondary-text'>
                                <p>Location</p>
                                <p className={`${location.length === maxLocationChars ? 'text-red-500' : null}`}>{`${location.length} / ${maxLocationChars}`}</p>
                            </label>
                            <TextareaAutosize
                                maxLength={maxLocationChars}
                                {...register('location')}
                                className='profile-textarea'
                                value={location}
                                onChange={(e) => setLocation(e.target.value)} />
                            {errors.location && (
                                <p className="text-center text-red-600 font-bold text-xs">{`${errors.location.message}`}</p>
                            )}
                        </div>
                        <div className='profile-bio-input'>
                            <label className='flex justify-between text-14 text-secondary-text'>
                                <p>Website</p>
                                <p className={`${website.length === maxWebsiteChars ? 'text-red-500' : null}`}>{`${website.length} / ${maxWebsiteChars}`}</p>
                            </label>
                            <TextareaAutosize
                                maxLength={maxWebsiteChars}
                                {...register('website')}
                                className='profile-textarea'
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)} />
                            {errors.website && (
                                <p className="text-center text-red-600 font-bold text-xs">{`${errors.website.message}`}</p>
                            )}
                        </div>
                    </form>
                    <DialogFooter>
                        {isSubmitting
                            ? (<Button disabled className='ml-auto font-bold w-fit rounded-3xl text-primary-text'>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving
                            </Button>)
                            : (<Button type="submit"
                                className='ml-auto font-bold w-fit rounded-3xl text-primary-text'
                                disabled={bio.length > 280}
                                form='editProfileForm'
                            >
                                Save
                            </Button>)
                        }
                    </DialogFooter>
                </DialogContent>
                : <DialogContent className="edit-profile-dialog">
                    <div className='h-fit flex items-center gap-6 px-2 mr-[25px] mb-4'>
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
            }
        </Dialog>
    )
}
