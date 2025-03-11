'use client';
import { formatPostDate } from "@/lib/utils";
import { CircleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import ConversationUser from "./ConversationUser";
import Link from "next/link";
import MessageBubble from "./ConversationMessageBubble";
import MessageStatus from "./ConversationMessageStatus";
import TypingIndicator from "./ConversationTypingIndicator";
import { ConversationMessageType, ConversationType } from 'tweetly-shared';
import { useUserContext } from '@/context/UserContextProvider';

type ConversationMessagesProps = {
    messages: ConversationMessageType[];
    receiverInfo: Pick<ConversationType, 'participants'>['participants'][0];
    loadingRef: (node?: Element | null) => void;
    scrollPositionRef: React.RefObject<number>;
    scrollPosition: number,
    endReached: boolean;
    receiverIsTyping: boolean;
}

export default function ConversationMessages({
    messages,
    receiverInfo,
    loadingRef,
    scrollPositionRef,
    scrollPosition,
    endReached,
    receiverIsTyping,
}: ConversationMessagesProps) {
    const { loggedInUser } = useUserContext();
    const [, setLastMessageTimeRefreshTrigger] = useState(false);
    const hasMountedRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const unreadMessageRef = useRef<HTMLDivElement>(null);
    const previousMessageCountRef = useRef(messages.length);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;

            if (unreadMessageRef.current && !hasMountedRef.current) {
                // Initial load: scroll to the unread message
                container.scrollTop = unreadMessageRef.current.offsetTop - 75;
                hasMountedRef.current = true;
            } else if (messages.length > previousMessageCountRef.current) {
                // Restore scroll position only when older messages are loaded
                const previousScrollHeight = container.scrollHeight;
                container.scrollTop = container.scrollHeight - previousScrollHeight + scrollPosition;
            } else {
                // For any other re-render, use the last scroll position
                container.scrollTop = scrollPosition;
            }

            // Update the previous message count reference
            previousMessageCountRef.current = messages.length;
        }
    }, [messages, scrollPosition]);

    // Track scroll position on user scroll
    function handleScroll(event: React.UIEvent<HTMLDivElement, UIEvent>) {
        const target = event.target as HTMLDivElement;
        scrollPositionRef.current = target.scrollTop;
    }

    // Get the last message and check whether sender is logged in user, check for read status, save message index for rendering
    const lastMessage = messages.slice(-1)[0];
    const lastMessageIndex = lastMessage ? messages.length - 1 : 0;

    // Refresh last message sent time every minute for the first hour
    useEffect(() => {
        if (!lastMessage || lastMessage.readStatus === true) return;

        const lastMessageTime = new Date(lastMessage.createdAt).getTime();
        const oneHour = 60 * 60 * 1000;

        const intervalId = setInterval(() => {
            const now = new Date().getTime();

            if (now - lastMessageTime < oneHour) {
                setLastMessageTimeRefreshTrigger((prev) => !prev);
            } else {
                clearInterval(intervalId);
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, [lastMessage]);

    // Get the last read message from receiver, to set the scroll to that message when logged in users opens the DMs
    const firstUnreadMessage = messages
        .filter((msg) => msg.sentBy === loggedInUser.username)
        .find((msg) => msg.readStatus === false);

    return (
        <div
            className='overflow-y-auto flex flex-col-reverse custom-scrollbar'
            onScroll={handleScroll}
            ref={scrollContainerRef} >
            <div className="grid grid-cols-1 grid-rows-conversation-messages">
                {endReached && (
                    <Link
                        href={`/${receiverInfo.username}`}
                        className='flex flex-col hover:bg-post-hover cursor-pointer'>
                        <ConversationUser user={receiverInfo} />
                        <div className='feed-hr-line mt-auto'></div>
                    </Link>
                )}

                <div className='flex flex-col px-3 py-4 gap-1 min-w-[1%]'>
                    {!endReached && (
                        <div ref={loadingRef}>
                            <p>Loading...</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={msg.id}
                            className={`message-content ${msg.sentBy === loggedInUser.username ? 'self-end' : 'self-start'} ${firstUnreadMessage && firstUnreadMessage.id === msg.id ? 'w-full !max-w-[100%] mt-4' : ''}`}
                            ref={firstUnreadMessage && firstUnreadMessage.id === msg.id ? unreadMessageRef : null}>
                            <div></div>
                            {msg.sentBy === loggedInUser.username
                                ? (
                                    <div className='flex flex-col'>
                                        <div className='flex items-center gap-2'>
                                            {msg.status === 'failed' && <CircleAlert size={20} className='text-red-400' />}
                                            <MessageBubble msg={msg} index={index} messages={messages} />
                                        </div>
                                        <div>
                                            {msg.status === 'sending' && <MessageStatus status="sending" />}
                                            {
                                                msg.status === 'sent' && index === lastMessageIndex
                                                    ? lastMessage.readStatus
                                                        ? <MessageStatus status='seen' />
                                                        : <p className='mt-1 mr-3 text-end text-secondary-text text-14'>
                                                            {
                                                                formatPostDate(msg.createdAt) === 'now' ? 'Sent' : `Sent ${formatPostDate(msg.createdAt)} ago`
                                                            }
                                                        </p>
                                                    : null
                                            }
                                        </div>
                                    </div>
                                )
                                : (
                                    <>
                                        {firstUnreadMessage && firstUnreadMessage.id === msg.id
                                            && <div className={`unread-message w-full ${messages[index === 0 ? 0 : index - 1].sentBy === loggedInUser.username ? 'mb-4' : ''}`}><span>Unread messages</span></div>}
                                        <div className='flex flex-col'>
                                            <div className='flex items-center gap-2'>
                                                {msg.status === 'failed' && <CircleAlert size={20} className='text-red-400' />}
                                                <MessageBubble msg={msg} index={index} messages={messages} />
                                            </div>
                                            <div>
                                                {
                                                    index === lastMessageIndex
                                                    && <p className='mt-1 ml-3 text-start text-secondary-text text-14'>
                                                        {
                                                            formatPostDate(msg.createdAt) === 'now' ? '' : `Received ${formatPostDate(msg.createdAt)} ago`
                                                        }
                                                    </p>
                                                }
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    ))}

                    {receiverIsTyping && <TypingIndicator />}
                </div>
            </div>
        </div>
    );
}
