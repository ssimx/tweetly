'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { ConversationMessageType } from 'tweetly-shared';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import Image from 'next/image';

interface MessageBubbleType {
    msg: ConversationMessageType,
    index: number,
    messages: ConversationMessageType[],
}

export default function MessageBubble({ msg, index, messages }: MessageBubbleType) {
    const { loggedInUser } = useUserContext();
    const isFirst = index === 0;
    const isLast = index === messages.length - 1;
    const prevMsgSameSender = !isFirst && messages[index - 1].sentBy === msg.sentBy;
    const nextMsgSameSender = !isLast && messages[index + 1].sentBy === msg.sentBy;

    const bubbleClasses = msg.sentBy !== loggedInUser.username
        ? `w-fit mr-auto bg-secondary-foreground p-3 ${prevMsgSameSender ? 'rounded-tl-none' : `rounded-tl-[25px] ${!isFirst && 'mt-4'}`} ${nextMsgSameSender ? 'rounded-bl-none' : 'rounded-bl-[25px]'} rounded-r-[25px]`
        : `w-fit ml-auto bg-primary text-white-1 p-3 ${prevMsgSameSender ? 'rounded-tr-none' : `rounded-tr-[25px] ${!isFirst && 'mt-4'}`} ${nextMsgSameSender ? 'rounded-br-none' : 'rounded-br-[25px]'} rounded-l-[25px]`;

    if (msg.images && msg.images.length) {
        return (
            <div>
                {msg.content && (
                    <p className={`!mt-2 !rounded-br-none ${bubbleClasses}`}>{msg.content}</p>
                )}

                <PhotoProvider>
                    <div className="">
                        {msg.images.map((item, index) => (
                            <PhotoView
                                key={index}
                                src={item}
                            >
                                <Image
                                    src={item}
                                    alt=""
                                    width={350} height={350}
                                    className='mt-1 rounded-xl hover:cursor-pointer'
                                />
                            </PhotoView>
                        ))}
                    </div>
                </PhotoProvider>
            </div>
        )
    }

    return <p className={bubbleClasses}>{msg.content}</p>;
}
