'use client';
import TextareaAutosize from 'react-textarea-autosize';
import { Image as Img, SendHorizontal, X } from "lucide-react";
import { useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { socket } from '@/lib/socket';
import { v4 as uuidv4 } from 'uuid';
import { useUserContext } from '@/context/UserContextProvider';
import { ALLOWED_IMAGE_TYPES, ConversationMessageType, ErrorResponse, FormNewConversationMessageDataType, newMessageDataSchema } from 'tweetly-shared';
import Image from 'next/image';
import { createNewConversationMessage } from '@/actions/actions';
import BarLoader from 'react-spinners/BarLoader';

type ConversationInputType = {
    conversationId: string,
    setMessages: React.Dispatch<React.SetStateAction<ConversationMessageType[]>>;
    messagesBottomReached: boolean,
    setScrollPosition: React.Dispatch<React.SetStateAction<number>>
};

export default function ConversationInput({ conversationId, setMessages, messagesBottomReached, setScrollPosition }: ConversationInputType) {
    const { loggedInUser } = useUserContext();
    const [selectedImagesPreview, setSelectedImagesPreview] = useState<string[]>([]);
    const [selectedImagesFiles, setSelectedImagesFiles] = useState<File[]>([]);
    const formId = useId();

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const maxChars = 10000;

    const [typing, setTyping] = useState(false);
    const [isSendingImage, setIsSendingImage] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
        reset,
        watch,
        setError,
        clearErrors,
        setValue,
        setFocus,
    } = useForm<FormNewConversationMessageDataType>({
        resolver: zodResolver(newMessageDataSchema),
        defaultValues: { conversationId: conversationId }
    });

    const textWatch = watch("text") ?? '';

    const stopTyping = () => {
        setTyping(false);
        socket.emit('conversation_typing_status', conversationId, null);
    };

    const handleTextChange = () => {
        if (!typing) {
            setTyping(true);
            socket.emit('conversation_typing_status', conversationId, loggedInUser.username);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(stopTyping, 2000);
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
        const selectedImages = Array.from(files);
        const validImages: File[] = [];

        selectedImages.forEach((image) => {
            if (!(image instanceof File)) {
                setError('images', {
                    type: 'manual',
                    message: 'Input is not a file',
                });
            } else if (image.size >= 5000000) {
                setError('images', {
                    type: 'manual',
                    message: 'Max image size is 5MB',
                });
            } else if (!(ALLOWED_IMAGE_TYPES.includes(image.type))) {
                setError('images', {
                    type: 'manual',
                    message: 'This image format is not supported',
                });
            }

            validImages.push(image);
        });

        setSelectedImagesFiles((current) => [...current, ...validImages]); // Array of file objects
        setSelectedImagesPreview((current) => [...current, ...validImages.map((image) => URL.createObjectURL(image))]); // Array of image previews
        setValue('images', [
            ...selectedImagesFiles,
            ...validImages
        ]);
    };

    const onSubmitMessage = async (formData: FormNewConversationMessageDataType) => {
        if (isSendingImage) return;

        const createdAt = new Date();
        // generate ID for the message, this will be used on the backend as well
        const msgTempId = uuidv4();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Optimistically add the temporary message if there's no images being uploaded
        if (formData.images === undefined || !formData.images.length) {
            setFocus("text");

            const tempMessage: ConversationMessageType = {
                id: msgTempId,
                tempId: msgTempId,
                content: formData.text,
                images: undefined,
                createdAt,
                updatedAt: createdAt,
                sentBy: loggedInUser.username,
                status: 'sending',
            };

            messagesBottomReached && setMessages((prevMessages) => [...prevMessages, tempMessage]);

            try {
                reset();
                const response = await createNewConversationMessage(formData, msgTempId);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response;
                if (!data) throw new Error('Data is missing in response');
                else if (data.message === undefined) throw new Error('Message property is missing in data response');

                // Update the message status and id from temporary to confirmed
                messagesBottomReached && setMessages((prevMessages) => {
                    return prevMessages.map(msg =>
                        msg.tempId === data.message.tempId
                            ? { ...data.message, status: 'sent' }
                            : msg
                    );
                });

                // emit new message to the receiver
                socket.emit('new_conversation_message', conversationId, data.message);
            } catch (error) {
                // Update the message to "failed" if there was an error
                messagesBottomReached && setMessages((prevMessages) => {
                    return prevMessages.map(msg =>
                        msg.tempId === tempMessage.tempId
                            ? { ...tempMessage, status: 'failed' }
                            : msg
                    );
                });

                console.error(error);
            } finally {
                stopTyping();

                setSelectedImagesPreview([]);
                setSelectedImagesFiles([]);
            }
        } else {
            try {
                setIsSendingImage(true);
                reset();
                const response = await createNewConversationMessage(formData, msgTempId);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response;
                if (!data) throw new Error('Data is missing in response');
                else if (data.message === undefined) throw new Error('Message property is missing in data response');

                messagesBottomReached && setMessages((prevMessages) => {
                    return [...prevMessages, data.message]
                });

                // emit new message to the receiver
                socket.emit('new_conversation_message', conversationId, data.message);
            } catch (error) {
                // Update the message to "failed" if there was an error
                messagesBottomReached && setMessages((prevMessages) => {
                    return [...prevMessages, {
                        id: msgTempId,
                        tempId: msgTempId,
                        content: formData.text,
                        images: formData.images!.map((imgFile) => URL.createObjectURL(imgFile)),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        readAt: undefined,
                        sentBy: loggedInUser.username,
                        status: 'failed',
                    }]
                });

                console.error(error);
            } finally {
                stopTyping();
                setIsSendingImage(false);
                setSelectedImagesPreview([]);
                setSelectedImagesFiles([]);
            }
        }

        reset();
        setScrollPosition(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (textWatch === '' || textWatch.length > maxChars) return;
            handleSubmit(onSubmitMessage)(); // Trigger form submission
        }
    };

    return (
        <div className='min-h-[65px] h-auto px-3 py-2 flex flex-col'>
            <div className='w-full'>
                <BarLoader
                    className={`loading-bar !w-full ${isSendingImage === false ? 'invisible' : ''}`}
                    height={2}
                    loading={true}
                    aria-label="Bar loader"
                    data-testid="loader"
                />
            </div>
            { // selected images preview
                (selectedImagesPreview.length > 0 && selectedImagesPreview.length < 5)
                    ? (
                        <div className={`w-full h-[150px] mb-4 mt-2 grid gap-1 grid-cols-4 grid-rows-1`}>
                            {selectedImagesPreview.map((image, index) => (
                                <div key={index} className='h-full relative'>
                                    <Image
                                        src={image}
                                        alt="Selected preview"
                                        className={`h-[150px] w-full object-cover rounded-md ${isSubmitting ? 'contrast-75' : ''}`}
                                        width={100} height={100} />
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

            <div className='h-full min-h-[50px] w-full'>
                <div className='h-full w-full flex-center gap-4 bg-[hsl(var(--post-hover))] rounded-[20px] px-4 py-2'>
                    <button className='group'
                        disabled={selectedImagesFiles.length >= 4}
                        onClick={() => imageInputRef.current?.click()}>
                        <Img size={22} className="text-primary group-hover:text-primary-text group-disabled:text-gray-500" />
                    </button>

                    <form suppressHydrationWarning onSubmit={handleSubmit(onSubmitMessage)} id={formId} className='w-full flex-center'>
                        <TextareaAutosize
                            suppressHydrationWarning
                            maxLength={maxChars}
                            maxRows={7}
                            className="h-[24px] w-full bg-transparent focus:outline-none text-16 resize-none overflow-y-auto"
                            placeholder="Type a new message"
                            {...register("text", {
                                onChange: handleTextChange,
                            })}
                            onKeyDown={handleKeyDown}
                        />
                    </form>

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

                    <button type='submit' form={formId} className='disabled:opacity-50'
                        disabled={isSubmitting || isSendingImage || (textWatch.length > 280 || textWatch.length === 0) && (selectedImagesFiles.length === 0 || selectedImagesFiles.length > 4)}
                    >
                        <SendHorizontal size={22} className='text-primary' />
                    </button>
                </div>
            </div>
        </div>
    )
}
