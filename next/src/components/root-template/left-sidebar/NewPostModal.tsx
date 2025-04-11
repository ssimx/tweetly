'use client';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Progress } from "@/components/ui/progress"
import { Feather, Image as Img, Loader2, X } from "lucide-react";
import Image from 'next/image';
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from 'react-textarea-autosize';
import { useUserContext } from "@/context/UserContextProvider";
import { socket } from "@/lib/socket";
import { createPost } from '@/actions/actions';
import { newPostDataSchema, FormNewPostDataType, SuccessResponse, BasePostDataType, isZodError, getErrorMessage } from 'tweetly-shared';
import { z } from 'zod';
import BarLoader from 'react-spinners/BarLoader';

export default function NewPostModal() {
    const [text, setText] = useState('');
    const [selectedImagesPreview, setSelectedImagesPreview] = useState<string[]>([]);
    const [selectedImagesFiles, setSelectedImagesFiles] = useState<File[]>([]);
    const [newPostError, setNewPostError] = useState('');
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const maxChars = 280;
    const { loggedInUser } = useUserContext();
    const charsPercentage = Math.min((text.length / maxChars) * 100, 100);
    const formId = useId();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
        setValue,
    } = useForm<FormNewPostDataType>({ resolver: zodResolver(newPostDataSchema) });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setText('');
            setSelectedImagesPreview([]);
            setSelectedImagesFiles([]);
            setValue('images', []);
            reset();
        }
    };

    const handleSelectedImages = async (files: FileList) => {
        if (files.length + selectedImagesFiles.length > 4) {
            setError('images', {
                type: 'manual',
                message: 'Please choose up to 4 photos.'
            });
            return;
        }

        clearErrors('images');
        const allowedFileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
        const selectedFiles = Array.from(files);
        const validFiles: File[] = [];

        selectedFiles.forEach((file) => {
            if (!allowedFileTypes.includes(file.type)) {
                setError('images', {
                    type: 'manual',
                    message: 'Only .jpg, .jpeg, .png and .webp formats are supported',
                });
                return;
            }
            validFiles.push(file);
        });

        setSelectedImagesFiles((current) => [...current, ...validFiles]); // Array of file objects
        setSelectedImagesPreview((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))]); // Array of image previews
        setValue('images', [
            ...selectedImagesFiles,
            ...validFiles
        ]);
    };

    const onSubmitModalPost = async (formData: FormNewPostDataType) => {
        if (isSubmitting) return;

        try {
            const response = await createPost(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else throw new Error(response.error.message);
            }

            const { data } = response as SuccessResponse<{ post: BasePostDataType }>;
            if (data === undefined) throw new Error('Data is missing in response');
            else if (data.post === undefined) throw new Error('Post property is missing in data response');

            // update feed only if it's not a reply
            if (!data.post.replyTo) {
                socket.emit('new_global_post', data.post);
                socket.emit('new_following_post', loggedInUser.id, data.post)
            }

            // send notification to users who have notifications enabled
            socket.emit('new_user_notification', loggedInUser.id);

            // hard redirect server action does not work, modal stays mounted / open
            const postUrl = `${window.location.origin}/${data.post.author.username}/status/${data.post.id}`;
            reset();
            return window.location.href = postUrl;
        } catch (error: unknown) {
            // Handle validation errors
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        console.error(detail.message);
                        setError(detail.path[0] as keyof FormNewPostDataType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
                setNewPostError('Something went wrong, contact support');
            } else {
                const errorMessage = getErrorMessage(error);
                console.error('Registration error:', errorMessage);
                setNewPostError(errorMessage);
            }
        }
    };

    return (
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger className='flex-center h-[50px] w-[50px] rounded-[50%] bg-primary text-white-1 font-bold xl:w-full xl:rounded-[30px]'>
                <Feather className='xl:hidden' />
                <p className='hidden xs:block'>Post</p>
            </DialogTrigger>
            <DialogContent className="min-h-[150px] h-auto w-[90%] sm:max-w-[550px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <VisuallyHidden.Root><DialogTitle>New Post</DialogTitle></VisuallyHidden.Root>
                <div className="grid grid-cols-post-layout gap-2 mt-4 min-h-[60px] sm:min-h-[80px]">
                    <Image
                        src={loggedInUser.profile?.profilePicture}
                        alt='User profile'
                        width={40} height={40}
                        className="w-[40xp] h-[40px] rounded-full" />
                    <form suppressHydrationWarning onSubmit={handleSubmit(onSubmitModalPost)} id={formId} className='pr-4'>
                        <TextareaAutosize
                            suppressHydrationWarning
                            maxLength={maxChars}
                            className='h-[28px] w-full focus:outline-none text-xl resize-none mt-2'
                            placeholder='What is happening?!'
                            {...register("text", {
                                onChange: (e) => handleTextChange(e),
                            })}
                        />
                        <Progress value={charsPercentage} className={`my-4 xs:my-2 ${text.length === 0 && 'invisible'}`} />
                        {charsPercentage === 100 && <p className='text-center text-red-600 font-bold text-xs'>Max characters reached</p>}
                        {errors.text && (
                            <p className="text-center text-red-600 font-bold text-xs">{`${errors.text.message}`}</p>
                        )}
                        { // selected images preview
                            selectedImagesPreview.length === 1
                                ? (
                                    <div className="mt-2 relative inline-block w-fit max-h-[500px]">
                                        <Image src={selectedImagesPreview[0]} alt="Selected preview" className="max-h-[500px] w-auto object-contain rounded-md" width={400} height={400} />
                                        <button type='button' className='absolute top-2 right-2 group rounded-full bg-black-1/40 p-1 flex-center'
                                            onClick={() => {
                                                setSelectedImagesPreview([]);
                                                setSelectedImagesFiles([]);
                                                setValue('images', []);
                                            }}>
                                            <X size={20} className='' />
                                        </button>
                                    </div>
                                )
                                : (selectedImagesPreview.length > 1 && selectedImagesPreview.length < 5)
                                    ? (
                                        <div className={`mt-2 grid gap-1 w-full h-[300px] ${selectedImagesPreview.length === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2'}`}>
                                            {selectedImagesPreview.map((image, index) => (
                                                <div key={index} className='h-full relative'>
                                                    <Image src={image} alt="Selected preview" className="h-full w-full object-cover rounded-md" width={400} height={400} />
                                                    <button type='button' className='absolute top-2 right-2 group rounded-full bg-black-1/40 p-1 flex-center'
                                                        onClick={() => {
                                                            const updatedImagesPreview = selectedImagesPreview.toSpliced(index, 1);
                                                            setSelectedImagesPreview(updatedImagesPreview);

                                                            const updatedImagesFiles = selectedImagesFiles.toSpliced(index, 1);
                                                            setSelectedImagesFiles(updatedImagesFiles)
                                                            setValue('images', updatedImagesFiles);
                                                        }}>
                                                        <X size={20} className='' />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                    : null
                        }
                    </form>
                </div>

                <div className='w-full'>
                    <BarLoader
                        className={`loading-bar !w-full ${isSubmitting === false ? 'invisible' : ''}`}
                        height={2}
                        loading={true}
                        aria-label="Bar loader"
                        data-testid="loader"
                    />
                </div>

                <DialogFooter>
                    <button className='group'
                        disabled={selectedImagesFiles.length >= 4}
                        onClick={() => imageInputRef.current?.click()}>
                        <Img size={24} className="text-primary group-hover:text-primary-text group-disabled:text-gray-500" />
                    </button>
                    <input
                        suppressHydrationWarning
                        type="file"
                        multiple
                        accept=".png, .jpg, .jpeg"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) {
                                handleSelectedImages(e.target.files);
                            }
                        }}
                        ref={(e) => {
                            imageInputRef.current = e; // Assign the ref for button
                            register("images").ref(e); // Connect the ref to React Hook Form
                            setValue('images', selectedImagesFiles);
                        }}
                    />
                    {errors.images && (
                        <p className="text-center text-red-600 font-bold text-xs ml-4">{`${errors.images.message}`}</p>
                    )}
                    {newPostError && (
                        <p className="text-center text-red-600 font-bold text-xs ml-4">{`${newPostError}`}</p>
                    )}

                    {isSubmitting
                        ? (<Button disabled className='ml-auto font-bold w-fit rounded-3xl text-white-1'>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting
                        </Button>)
                        : (<Button type="submit"
                            className='ml-auto font-bold w-fit rounded-3xl text-white-1'
                            disabled={(text.length > 280 || text.length === 0) && (selectedImagesFiles.length === 0 || selectedImagesFiles.length > 4)}
                            form={formId}
                        >
                            Post
                        </Button>)
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

