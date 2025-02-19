'use client';
import { Button } from "@/components/ui/button"
import {
    DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress"
import { Image as Img, Loader2, X } from "lucide-react";
import Image from 'next/image';
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from 'react-textarea-autosize';
import { useUserContext } from "@/context/UserContextProvider";
import { socket } from "@/lib/socket";
import { createPost } from "@/actions/actions";
import { newPostDataSchema, NewPostDataType } from 'tweetly-shared';

export default function NewPost({ reply, placeholder }: { reply?: number, placeholder?: string }) {
    const [text, setText] = useState('');
    const [, setInputActive] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedImagesFiles, setSelectedImagesFiles] = useState<File[]>([]);
    const [newPostError, setNewPostError] = useState('');
    const formRef = useRef<HTMLFormElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const maxChars = 280;
    const charsPercentage = Math.min((text.length / maxChars) * 100, 100);
    const { loggedInUser } = useUserContext();
    const formId = useId();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
        setValue,
    } = useForm<NewPostDataType>({ resolver: zodResolver(newPostDataSchema) });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleClickOutside = (e: MouseEvent) => {
        e.stopPropagation();
        if (e.target as Node !== document.activeElement) {
            setInputActive(() => false);
            window.removeEventListener('click', handleClickOutside);
        }
    };

    function handleClick(e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) {
        e.stopPropagation();
        if (e.target === document.activeElement) {
            setInputActive(() => true);
            window.addEventListener('click', handleClickOutside);
        }
    };

    const handleSelectedImages = async (files: FileList) => {
        if (files.length + selectedImages.length > 4) {
            setError('images', {
                type: 'manual',
                message: 'Please choose up to 4 photos.'
            });
            return;
        }

        clearErrors('images');
        const allowedFileTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        const selectedFiles = Array.from(files);
        const validFiles: File[] = [];

        selectedFiles.forEach((file) => {
            if (!allowedFileTypes.includes(file.type)) {
                setError('images', {
                    type: 'manual',
                    message: 'File types allowed: png, jpg, jpeg',
                });
                return;
            }
            validFiles.push(file);
        });
        
        setSelectedImagesFiles((current) => [...current, ...validFiles]); // Array of file objects
        setSelectedImages((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))]); // Array of image previews
        setValue('images', [...selectedImages, ...validFiles.map((file) => URL.createObjectURL(file))]);
    };

    const onSubmitPost = async (data: NewPostDataType) => {
        if (isSubmitting) return;

        try {
            data.replyToId = reply;

            if (selectedImagesFiles.length !== 0) {
                const imagesUploadPromises = selectedImagesFiles.map((image) => {
                    const formData = new FormData();
                    formData.append('file', image);
                    formData.append('upload_preset', 'postPictures');
                    return fetch('https://api.cloudinary.com/v1_1/ddj6z1ptr/image/upload', {
                        method: 'POST',
                        body: formData,
                    });
                });

                const imagesResult = await Promise.all([...imagesUploadPromises])
                    .then((responses) => Promise.all(responses.map((res) => res.json())))
                    .then((imageResults) => imageResults.map((image) => {
                        if (typeof image === 'object' && image !== null && 'secure_url' in image && 'public_id' in image) {
                            return {
                                secure_url: image.secure_url as string,
                                public_id: image.public_id as string,
                            };
                        }
                        console.error('Image upload failed');
                        return;
                    }));

                console.log(data)
                data.images = imagesResult.length !== 0
                    ? imagesResult.filter((img): img is { secure_url: string, public_id: string } => img?.secure_url !== undefined).map((img) => img.secure_url)
                    : undefined;
                console.log(data)
                data.imagesPublicIds = imagesResult.length !== 0
                    ? imagesResult.filter((img): img is { secure_url: string, public_id: string } => img?.public_id !== undefined).map((img) => img.public_id)
                    : undefined;
            }

            const postData = await createPost(data);
            console.log(postData)

            if (!postData) {
                setNewPostError('Something went wrong');
                throw new Error('Something went wrong');
            }

            // update feed only if it's not a reply
            if (!reply) {
                socket.emit('new_global_post');
                socket.emit('new_following_post', postData.author.id)
            }

            // send notification to users
            socket.emit('new_user_notification', postData.author.id);

            // hard redirect server action does not work
            return window.location.href = `http://localhost:3000/${postData.author.username}/status/${postData.id}`;
        } catch (error) {
            console.error(error);
            setSelectedImages([]);
            setText('');
            reset();
        }
    };

    return (
        <div className={`border-y h-fit flex flex-col px-4 min-h-[100px]`}>
            <div className="grid grid-cols-post-layout gap-4 my-2 h-full">
                <Image src={loggedInUser.profile?.profilePicture}
                    alt='User profile'
                    width={54} height={54}
                    className="w-[54px] h-[54px] rounded-full" />
                <form onSubmit={handleSubmit(onSubmitPost)} id={formId} className='min-h-full pr-4 flex flex-col' ref={formRef}>
                    <TextareaAutosize maxLength={maxChars}
                        className='h-[28px] mt-3 mb-auto w-full focus:outline-none text-xl resize-none bg-transparent'
                        placeholder={placeholder ? placeholder : 'What is happening?!'}
                        onClick={(e) => handleClick(e)}
                        {...register("text", {
                            onChange: (e) => handleTextChange(e),
                        })} />
                    { // selected images preview
                    selectedImages.length === 1
                        ? (
                            <div className="mt-2 relative inline-block w-fit max-h-[500px]">
                                <Image src={selectedImages[0]} alt="Selected preview" className="max-h-[500px] w-auto object-contain rounded-md" width={400} height={400} />
                                <button type='button' className='absolute top-2 right-2 group rounded-full bg-black-1/40 p-1 flex-center'
                                    onClick={() => {
                                        setSelectedImages([]);
                                        setValue('images', []);
                                    }}>
                                    <X size={20} className='' />
                                </button>
                            </div>
                        )
                        : (selectedImages.length > 1 && selectedImages.length < 5)
                            ? (
                                <div className={`mt-2 grid gap-1 w-full h-[300px] ${selectedImages.length === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2'}`}>
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className='h-full relative'>
                                            <Image src={image} alt="Selected preview" className="h-full w-full object-cover rounded-md" width={400} height={400} />
                                            <button type='button' className='absolute top-2 right-2 group rounded-full bg-black-1/40 p-1 flex-center'
                                                onClick={() => {
                                                    const updatedImages = selectedImages.toSpliced(index, 1);
                                                    setSelectedImages(updatedImages);
                                                    setValue('images', updatedImages);
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

            <Progress value={charsPercentage} className={`mt-auto ${text.length === 0 && 'invisible'}`} />
            {charsPercentage === 100 && <p className='text-center text-red-600 font-bold text-xs'>Max characters reached</p>}
            {errors.text && (
                <p className="text-center text-red-600 font-bold text-xs">{`${errors.text.message}`}</p>
            )}

            <DialogFooter>
                <button className='group'
                    disabled={selectedImages.length >= 4}
                    onClick={() => imageInputRef.current?.click()}>
                    <Img size={24} className="text-primary group-hover:text-primary-text group-disabled:text-gray-500" />
                </button>
                <input
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
                        setValue('images', []);
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
                        disabled={(text.length > 280 || text.length === 0) && (selectedImages.length === 0 || selectedImages.length > 4)}
                        form={formId}
                    >
                        Post
                    </Button>)
                }
            </DialogFooter>
        </div>
    )
}
