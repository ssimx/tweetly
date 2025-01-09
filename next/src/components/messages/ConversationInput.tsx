'use client';
import TextareaAutosize from 'react-textarea-autosize';
import { Image as Img, SendHorizontal } from "lucide-react";
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { socket } from '@/lib/socket';
import { AllMessagesType } from './ConversationContent';
import { v4 as uuidv4 } from 'uuid';
import { useUserContext } from '@/context/UserContextProvider';

export const newMessageSchema = z.object({
    text: z
        .string()
        .min(1, 'Please enter the message')
        .max(100000, "Message can't exceed 100000 characters"),
});
type MessageData = z.infer<typeof newMessageSchema>;

interface ConversationInputType {
    conversationId: string,
    setAllMessagesOrdered: React.Dispatch<React.SetStateAction<AllMessagesType[]>>;
    setScrollPosition: React.Dispatch<React.SetStateAction<number>>
};

export default function ConversationInput({ conversationId, setAllMessagesOrdered, setScrollPosition }: ConversationInputType) {
    const [typing, setTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { loggedInUser } = useUserContext();
    const maxChars = 10000;

    const {
        register,
        handleSubmit,
        reset,
        watch,
    } = useForm<MessageData>({ resolver: zodResolver(newMessageSchema) });

    const inputText = watch("text");

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

        typingTimeoutRef.current = setTimeout(stopTyping, 3000);
    };

    const onSubmitMessage = async (data: MessageData) => {
        const createdAt = new Date().getTime();
        const msgTempId = uuidv4();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Optimistically add the temporary message
        const tempMessage: AllMessagesType = {
            id: msgTempId,
            content: data.text,
            createdAt,
            sender: true,
            readStatus: false,
            status: 'sending',
        };
        setAllMessagesOrdered((prevMessages) => [...prevMessages, tempMessage]);

        reset();
        setScrollPosition(0);

        try {
            const response = await fetch('/api/conversations/messages/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: data.text, conversationId }),
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            const confirmedMessage = await response.json() as {
                id: string,
                content: string,
                createdAt: string,
                senderId: number,
                receiverId: number,
            };

            // Update the message status and id from temporary to confirmed
            setAllMessagesOrdered((prevMessages) => {
                const messages = prevMessages.toSpliced(-1, 1) as AllMessagesType[];
                return [...messages, {
                    id: confirmedMessage.id,
                    content: data.text,
                    createdAt,
                    sender: true,
                    readStatus: false,
                    status: 'sent',
                }]
            });

            // emit new message to the receiver
            stopTyping();
            socket.emit('new_conversation_message', conversationId, confirmedMessage);
            socket.emit('new_user_message', confirmedMessage.receiverId);
        } catch (error) {
            // Update the message to "failed" if there was an error
            setAllMessagesOrdered((prevMessages) => {
                const messages = prevMessages.splice(-1, 1) as AllMessagesType[];
                return [...messages, {
                    id: msgTempId,
                    content: data.text,
                    createdAt,
                    sender: true,
                    readStatus: false,
                    status: 'failed',
                }]
            });

            console.error(error);
            reset();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputText === '' || inputText.length > maxChars) return;
            handleSubmit(onSubmitMessage)(); // Trigger form submission
        }
    };

    return (
        <div className='min-h-[65px] h-auto'>
            <div className='h-full min-h-[50px] w-full px-3 py-2 '>
                <div className='h-full w-full flex-center gap-4 bg-[hsl(var(--post-hover))] rounded-[20px] p-2'>
                    <Img size={22} className='text-primary' />
                    <form onSubmit={handleSubmit(onSubmitMessage)} id='messagePostForm' className='w-full flex-center'>
                        <TextareaAutosize
                            maxLength={maxChars}
                            maxRows={7}
                            className='h-[24px] w-full bg-transparent focus:outline-none text-16 resize-none'
                            placeholder='Type a new message'
                            {...register("text", {
                                onChange: handleTextChange,
                            })}
                            onKeyDown={handleKeyDown}
                        />
                    </form>
                    <button type='submit' form='messagePostForm' className='disabled:opacity-50'
                        disabled={!inputText || inputText.length > maxChars} >
                        <SendHorizontal size={22} className='text-primary' />
                    </button>
                </div>
            </div>
        </div>
    )
}
