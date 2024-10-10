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
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from 'react-textarea-autosize';
import { z } from "zod";
import { Button } from "../ui/button";
import { Loader2, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { CropperRef, Cropper } from 'react-advanced-cropper';
// import 'react-advanced-cropper/dist/style.css';

type ProfileInfoData = z.infer<typeof updateProfileSchema>;


export default function EditProfileBtn({ user }: { user: ProfileInfo }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(user.profile.name);
    const [bio, setBio] = useState(user.profile.bio);
    const [location, setLocation] = useState(user.profile.location);
    const [website, setWebsite] = useState(user.profile.websiteUrl);
    const [bannerPicture, setBannerPicture] = useState<File | string | null>(null);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [bannerPicturePreview, setBannerPicturePreview] = useState<string>(user.profile.bannerPicture);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>(user.profile.profilePicture);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const profileInputRef = useRef<HTMLInputElement | null>(null);
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

    const updateProfile = async (data: ProfileInfoData) => {
        try {
            let bannerPicturePublicId = '';
            let profilePicturePublicId = '';

            if (bannerPicture !== null || profilePicture !== null) {
                let bannerPictureData: FormData | undefined;
                let profilePictureData: FormData | undefined;

                if (bannerPicture instanceof File) {
                    // Is banner a File
                    bannerPictureData = new FormData();
                    bannerPictureData.append('file', bannerPicture as File);
                    bannerPictureData.append('upload_preset', 'bannerPicture');
                } else if (typeof bannerPicture === 'string') {
                    // Is banner an empty string = user removed it
                    data.bannerPicture = '';
                } // if its null, skip it because it hasn't changed

                console.log(data.bannerPicture);


                if (profilePicture) {
                    profilePictureData = new FormData();
                    profilePictureData.append('file', profilePicture);
                    profilePictureData.append('upload_preset', 'profilePicture');
                }

                const bannerPicturePromise = bannerPicture ? fetch('https://api.cloudinary.com/v1_1/ddj6z1ptr/image/upload', {
                    method: 'POST',
                    body: bannerPictureData,
                }) : Promise.resolve(null);

                const profilePicturePromise = profilePicture ? fetch('https://api.cloudinary.com/v1_1/ddj6z1ptr/image/upload', {
                    method: 'POST',
                    body: profilePictureData,
                }) : Promise.resolve(null);

                const promises: Promise<Response | null>[] = [bannerPicturePromise, profilePicturePromise]
                const responses = await Promise.allSettled(promises);
                const [bannerUploadResult, profileUploadResult] = responses;

                if (bannerPicture && bannerUploadResult.status === 'fulfilled') {
                    const bannerResponse = await bannerUploadResult.value!.json();
                    if (!bannerResponse.secure_url) {
                        console.error('Banner image upload failed:', bannerResponse);
                        return;
                    }
                    data.bannerPicture = bannerResponse.secure_url;
                    bannerPicturePublicId = bannerResponse.public_id;
                } else if (bannerUploadResult && bannerUploadResult.status === 'rejected') {
                    console.error('Banner image upload failed:', bannerUploadResult.reason);
                }

                if (profilePicture && profileUploadResult.status === 'fulfilled') {
                    const profileResponse = await profileUploadResult.value!.json();
                    if (!profileResponse.secure_url) {
                        console.error('Profile image upload failed:', profileResponse);
                        return;
                    }
                    data.profilePicture = profileResponse.secure_url;
                    profilePicturePublicId = profileResponse.public_id;
                } else if (profileUploadResult && profileUploadResult.status === 'rejected') {
                    console.error('Profile image upload failed:', profileUploadResult.reason);
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
        setBannerPicture('');
        setBannerPicturePreview('');
    };

    // const onChange = (cropper: CropperRef) => {
    //     console.log(cropper.getCoordinates(), cropper.getCanvas());
    // };

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

        const imageUrl = URL.createObjectURL(file);

        console.log(type);

        if (type === 'banner') {
            setBannerPicture(file);
            setBannerPicturePreview(imageUrl);
        } else {
            setProfilePicture(file);
            setProfilePicturePreview(imageUrl);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className='edit-profile-btn'>
                Edit profile
            </DialogTrigger>
            <DialogContent className="edit-profile-dialog">
                <div className='h-[35px] text-20 font-bold'>Edit profile</div>

                <div className='picture-banner-container h-[150px]'>
                    <div className='w-full h-full'>
                        <div className='relative w-full h-full flex-center gap-2'>
                            {bannerPicturePreview !== ''
                                ? (
                                    <>
                                        <Image
                                            src={bannerPicturePreview}
                                            alt='User banner picture'
                                            height={100} width={100}
                                            className='w-full h-full absolute' />

                                        <button className=' z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                            onClick={() => bannerInputRef.current?.click()}>
                                            <ImagePlus size={20} className='text-white-1' />
                                        </button>
                                        <button className=' z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                            onClick={handleRemoveBanner}>
                                            <X size={20} className='text-white-1' />
                                        </button>
                                    </>)
                                : (
                                    <>
                                        <div className='w-full h-full absolute bg-dark-300' ></div>

                                        <button className=' z-10 bg-black-1/50 p-3 rounded-full hover:bg-black-1/30'
                                            onClick={() => bannerInputRef.current?.click()}>
                                            <ImagePlus size={20} className='text-white-1' />
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

                            {/* { user.profile.bannerPicture !== bannerPicturePreview && (
                                <Cropper
                                    src={bannerPicturePreview as string}
                                    onChange={onChange}
                                    className={'cropper'}
                                />
                            )} */}
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
                                <ImagePlus size={20} className='text-white-1' />
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

                <form onSubmit={handleSubmit(updateProfile)} id='editProfileForm' className='pr-4 mt-[75px]'>
                    <div className='profile-bio-input'>
                        <label className='flex justify-between text-14 text-dark-500'>
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
                        <label className='flex justify-between text-14 text-dark-500'>
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
                        <label className='flex justify-between text-14 text-dark-500'>
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
                        <label className='flex justify-between text-14 text-dark-500'>
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
                        ? (<Button disabled className='ml-auto font-bold w-fit rounded-3xl text-white-1'>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>)
                        : (<Button type="submit"
                            className='ml-auto font-bold w-fit rounded-3xl text-white-1'
                            disabled={bio.length > 280}
                            form='editProfileForm'
                        >
                            Save
                        </Button>)
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
