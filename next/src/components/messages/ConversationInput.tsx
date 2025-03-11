'use client';
import TextareaAutosize from 'react-textarea-autosize';
import { Image as Img, SendHorizontal, X } from "lucide-react";
import { useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { socket } from '@/lib/socket';
import { v4 as uuidv4 } from 'uuid';
import { useUserContext } from '@/context/UserContextProvider';
import { ConversationMessageType, ErrorResponse, FormNewConversationMessageDataType, newMessageDataSchema } from 'tweetly-shared';
import Image from 'next/image';
import { createNewConversationMessage } from '@/actions/actions';

type ConversationInputType = {
    conversationId: string,
    setMessages: React.Dispatch<React.SetStateAction<ConversationMessageType[]>>;
    setScrollPosition: React.Dispatch<React.SetStateAction<number>>
};

export default function ConversationInput({ conversationId, setMessages, setScrollPosition }: ConversationInputType) {
    const { loggedInUser } = useUserContext();
    const [selectedImagesPreview, setSelectedImagesPreview] = useState<string[]>([]);
    const [selectedImagesFiles, setSelectedImagesFiles] = useState<File[]>([]);
    const formId = useId();

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const maxChars = 10000;

    const [typing, setTyping] = useState(false);
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

        typingTimeoutRef.current = setTimeout(stopTyping, 1000);
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
        setSelectedImagesPreview((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))]); // Array of image previews
        setValue('images', [
            ...selectedImagesFiles,
            ...validFiles
        ]);
    };

    const onSubmitMessage = async (formData: FormNewConversationMessageDataType) => {
        if (isSubmitting) return;

        const createdAt = new Date();
        const msgTempId = uuidv4();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Optimistically add the temporary message if there's no images being uploaded
        if (formData.images === undefined) {
            const tempMessage: ConversationMessageType = {
                id: msgTempId,
                content: formData.text,
                images: undefined,
                createdAt,
                updatedAt: createdAt,
                sentBy: loggedInUser.username,
                readStatus: false,
                status: 'sending',
            };

            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            try {
                const response = await createNewConversationMessage(formData);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response;
                if (!data) throw new Error('Data is missing in response');
                else if (data.message === undefined) throw new Error('Message property is missing in data response');

                // Update the message status and id from temporary to confirmed
                setMessages((prevMessages) => {
                    const messages = prevMessages.toSpliced(-1, 1) as ConversationMessageType[];
                    return [...messages, data.message]
                });

                setSelectedImagesPreview([]);
                setSelectedImagesFiles([]);

                // emit new message to the receiver
                stopTyping();
                socket.emit('new_conversation_message', conversationId, data.message);
                // socket.emit('new_user_message', data.message.receiverId);
            } catch (error) {
                // Update the message to "failed" if there was an error
                setMessages((prevMessages) => {
                    const messages = prevMessages.splice(-1, 1) as ConversationMessageType[];
                    return [...messages, {
                        id: msgTempId,
                        content: formData.text,
                        images: undefined,
                        createdAt,
                        updatedAt: createdAt,
                        sentBy: loggedInUser.username,
                        readStatus: false,
                        status: 'failed',
                    }]
                });

                setSelectedImagesPreview([]);
                setSelectedImagesFiles([]);

                console.error(error);
                reset();
            }
        } else {
            try {
                const response = await createNewConversationMessage(formData);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response;
                if (!data) throw new Error('Data is missing in response');
                else if (data.message === undefined) throw new Error('Message property is missing in data response');

                // Update the message status and id from temporary to confirmed
                setMessages((prevMessages) => {
                    return [...prevMessages, data.message]
                });

                setSelectedImagesPreview([]);
                setSelectedImagesFiles([]);

                // emit new message to the receiver
                stopTyping();
                socket.emit('new_conversation_message', conversationId, data.message);
                // socket.emit('new_user_message', data.message.receiverId);
            } catch (error) {
                // Update the message to "failed" if there was an error
                setMessages((prevMessages) => {
                    return [...prevMessages, {
                        id: msgTempId,
                        content: formData.text,
                        images: selectedImagesPreview,
                        createdAt,
                        updatedAt: createdAt,
                        sentBy: loggedInUser.username,
                        readStatus: false,
                        status: 'failed',
                    }]
                });

                setSelectedImagesPreview([]);
                setSelectedImagesFiles([]);

                console.error(error);
                reset();
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
            { // selected images preview
                (selectedImagesPreview.length > 0 && selectedImagesPreview.length < 5)
                    ? (
                        <div className={`w-full h-[150px] mb-2 grid gap-1 grid-cols-4 grid-rows-1`}>
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

                    <form onSubmit={handleSubmit(onSubmitMessage)} id={formId} className='w-full flex-center'>
                        <TextareaAutosize
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
                        disabled={isSubmitting || (textWatch.length > 280 || textWatch.length === 0) && (selectedImagesFiles.length === 0 || selectedImagesFiles.length > 4)}
                    >
                        <SendHorizontal size={22} className='text-primary' />
                    </button>
                </div>
            </div>
        </div>
    )
}
