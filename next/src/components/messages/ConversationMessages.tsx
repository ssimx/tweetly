'use client';
import { formatMessageReceived, formatMessageSeen, formatMessageSent } from "@/lib/utils";
import { CircleAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from "react";
import ConversationUser from "./ConversationUser";
import Link from "next/link";
import MessageBubble from "./ConversationMessageBubble";
import TypingIndicator from "./ConversationTypingIndicator";
import { ConversationMessageType, ConversationType } from 'tweetly-shared';
import { useUserContext } from '@/context/UserContextProvider';
import ClipLoader from "react-spinners/ClipLoader";
import Image from 'next/image';

type ConversationMessagesProps = {
    messages: ConversationMessageType[],
    unreadMessageId: string | null,
    receiverInfo: Pick<ConversationType, 'participants'>['participants'][0],
    topCursor: string | null,
    topRef: (node?: Element | null) => void,
    topReached: boolean,
    bottomCursor: string | null,
    bottomRef: (node?: Element | null) => void,
    bottomReached: boolean,
    scrollPositionRef: React.RefObject<number>,
    scrollPosition: number,
    receiverIsTyping: boolean,
};

export default function ConversationMessages({
    messages,
    unreadMessageId,
    receiverInfo,
    topCursor,
    topRef,
    topReached,
    bottomCursor,
    bottomRef,
    bottomReached,
    scrollPositionRef,
    scrollPosition,
    receiverIsTyping,
}: ConversationMessagesProps) {
    const { loggedInUser } = useUserContext();
    const [, setLastMessageTimeRefreshTrigger] = useState(false);
    const hasMountedRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollContainerPreviousHeight = useRef<number | null>(null);
    const unreadMessageElementRef = useRef<HTMLDivElement>(null);
    const [isSeenAtMessageVisible, setIsSeenAtMessageVisible] = useState(false);
    const previousTopMessageCursorRef = useRef(topCursor);
    const previousBottomMessageCursorRef = useRef(bottomCursor);
    const isAtBottom = useRef(true);
    const userScrolledUp = useRef(false);

    // Get the last message that was sent by the logged in user and seen by the receiver
    const lastSeenMessage: ConversationMessageType | null = messages
        .filter((msg) => msg.sentBy === loggedInUser.username)
        .findLast((msg) => msg.readAt) ?? null;
    
    // Get last message sent by other party
    const lastReceivedMessage: ConversationMessageType | null = messages
        .findLast((msg) => msg.sentBy !== loggedInUser.username) ?? null;

    // Get the last message for random functionalities
    const lastMessage = messages.filter(msg => msg.status === 'sent').slice(-1)[0];

    // Track scroll position on user scroll
    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = event.target as HTMLDivElement;
        scrollPositionRef.current = target.scrollTop;

        // Check if user is at bottom of messages
        const atBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 20; // 20px threshold
        isAtBottom.current = atBottom;

        // Track if user has manually scrolled up
        if (!atBottom) {
            userScrolledUp.current = true;
        }
    }, [scrollPositionRef]);

    // Handle scroll for new messages
    useEffect(() => {
        if (scrollContainerRef.current && messages.length > 0) {
            // If we're at the bottom or this is a new message from the current user, scroll to bottom
            const container = scrollContainerRef.current;
            const lastMsg = messages[messages.length - 1];

            // Keep scroll sticky at the bottom of the conversation if:
            // 1. User is already at bottom, OR
            // 2. The new message is from the current user
            if (isAtBottom.current || (lastMsg && lastMsg.sentBy === loggedInUser.username)) {
                // Use a short timeout to ensure DOM has updated
                setTimeout(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight;
                        isAtBottom.current = true;
                    }
                }, 10);
            }
        }
    }, [messages, loggedInUser.username]);

    // Handling scroll for paging
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            if (unreadMessageElementRef.current && !hasMountedRef.current) {
                // Initial load: scroll to the unread message
                container.scrollTop = unreadMessageElementRef.current.offsetTop - 75;
                hasMountedRef.current = true;

                // Check if this position is at the bottom of the conversation
                setTimeout(() => {
                    if (container) {
                        isAtBottom.current = Math.abs(container.scrollHeight - container.clientHeight - container.scrollTop) < 20;
                    }
                }, 100); // Small delay to ensure DOM has settled
            } else if (topCursor !== previousTopMessageCursorRef.current) {
                // Restore scroll position when OLDER messages loaded
                const previousScrollHeight = container.scrollHeight;
                container.scrollTop = container.scrollHeight - previousScrollHeight + scrollPosition;
                // Update previous top cursor ID
                previousTopMessageCursorRef.current = topCursor;
            } else if (bottomCursor !== previousBottomMessageCursorRef.current) {
                // Restore scroll position when NEWER messages loaded
                const containerPreviousHeight = scrollContainerPreviousHeight.current ? scrollContainerPreviousHeight.current : 0;
                const containerNewHeight = container.scrollHeight;
                container.scrollTop = containerPreviousHeight - containerNewHeight;
                // Update previous bottom cursor ID
                previousBottomMessageCursorRef.current = bottomCursor;
            }

            scrollContainerPreviousHeight.current = container.scrollHeight;
        }
    }, [bottomCursor, topCursor, scrollPosition]);

    // Rerender component every minute to update message time
    useEffect(() => {
        const intervalId = setInterval(() => {
            setLastMessageTimeRefreshTrigger((prev) => !prev);
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div
            className='overflow-y-auto flex flex-col-reverse custom-scrollbar'
            onScroll={handleScroll}
            ref={scrollContainerRef} >
            <div className="grid grid-cols-1 grid-rows-conversation-messages">
                {topReached && (
                    <Link
                        href={`/${receiverInfo.username}`}
                        className='flex flex-col hover:bg-post-hover cursor-pointer'>
                        <ConversationUser user={receiverInfo} />
                        <div className='feed-hr-line mt-auto'></div>
                    </Link>
                )}

                <div className='flex flex-col px-3 py-4 gap-1 min-w-[1%]'>
                    {!topReached && (
                        <div ref={topRef} className='w-full flex-center mb-6 mt-[50px]'>
                            <ClipLoader
                                className='loading-spinner'
                                loading={true}
                                size={25}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={msg.id}
                            className={`w-[100%] flex items-center ${msg.sentBy === loggedInUser.username ? 'justify-end' : 'justify-start'}`}
                            ref={unreadMessageId === msg.id ? unreadMessageElementRef : null}
                        >
                            {msg.sentBy === loggedInUser.username
                                ? (
                                    <div className='flex flex-col w-[80%] h-fit self-end'>
                                        <div className='flex items-center gap-2'>
                                            {msg.status === 'failed' && <div title='Message failed to send'>
                                                <CircleAlert size={20} className='text-red-400' />
                                            </div>}
                                            <MessageBubble msg={msg} index={index} messages={messages} />
                                        </div>
                                        <div>
                                            {
                                                msg.status === 'sending' && (
                                                    <p className='mt-1 mr-3 text-end text-secondary-text text-14'>Sending</p>
                                                )
                                            }
                                            {
                                                msg.status === 'sent' && bottomReached
                                                    ? lastSeenMessage && lastReceivedMessage && (msg.id === lastSeenMessage.id) && (lastReceivedMessage && (msg.createdAt > lastReceivedMessage.createdAt))
                                                        ? (
                                                            <button
                                                                className='size-fit min-w-full my-1 rounded-full ml-auto'
                                                                onTouchEnd={() => setIsSeenAtMessageVisible((current) => !current)}
                                                            >
                                                                <Image
                                                                    src={receiverInfo.profile.profilePicture}
                                                                    alt='Receiver profile picture'
                                                                    width={16} height={16}
                                                                    className='animate-in ml-auto rounded-full border border-secondary-text'
                                                                    title={formatMessageSeen(msg.createdAt)}
                                                                />
                                                                {isSeenAtMessageVisible && (
                                                                    <p className='text-secondary-text text-[0.8rem]'>{formatMessageSeen(msg.createdAt)}</p>
                                                                )}
                                                            </button>

                                                        )
                                                        : msg.id === lastMessage.id
                                                            ? (
                                                                <p className='mt-1 mr-3 text-end text-secondary-text text-14'>
                                                                    {
                                                                        formatMessageSent(msg.createdAt)
                                                                    }
                                                                </p>
                                                            )
                                                            : null
                                                    : null
                                            }
                                        </div>
                                    </div>
                                )
                                : (
                                    <div className='w-full'>
                                        {msg.id === unreadMessageId
                                            && (
                                                <div
                                                    className={`unread-message w-full ${messages[index === 0 ? 0 : index - 1].sentBy === loggedInUser.username ? 'mt-4' : ''}`}
                                                >
                                                    <span>Unread messages</span>
                                                </div>
                                            )
                                        }
                                        <div className={`flex flex-col ${msg.id === lastMessage.id ? 'w-[100%]' : 'w-[80%]'}`}>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-[80%]'>
                                                    {msg.status === 'failed' && <CircleAlert size={20} className='text-red-400' />}
                                                    <MessageBubble msg={msg} index={index} messages={messages} />
                                                </div>
                                                {msg.id === lastMessage.id && bottomReached && (
                                                    <Image
                                                        src={receiverInfo.profile.profilePicture}
                                                        alt='Receiver profile picture'
                                                        width={16} height={16}
                                                        className='animate-in ml-auto self-end my-1 rounded-full border border-secondary-text'
                                                        title={formatMessageReceived(msg.createdAt)}
                                                    />
                                                )}
                                            </div>
                                            {
                                                msg.id === lastMessage.id && bottomReached && (
                                                    <p className='mt-1 ml-3 text-start text-secondary-text text-14'>
                                                        {
                                                            formatMessageReceived(msg.createdAt)
                                                        }
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    ))}

                    {!bottomReached && (
                        <div ref={bottomRef} className='w-full flex-center mt-6 mb-2'>
                            <ClipLoader
                                color={''}
                                loading={true}
                                size={25}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                    )}

                    {receiverIsTyping && bottomReached && <TypingIndicator />}
                </div>
            </div>
        </div>
    );
}
