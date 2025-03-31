'use client';
import { formatPostDate } from "@/lib/utils";
import { CircleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import ConversationUser from "./ConversationUser";
import Link from "next/link";
import MessageBubble from "./ConversationMessageBubble";
import TypingIndicator from "./ConversationTypingIndicator";
import { ConversationMessageType, ConversationType } from 'tweetly-shared';
import { useUserContext } from '@/context/UserContextProvider';
import ClipLoader from "react-spinners/ClipLoader";

type ConversationMessagesProps = {
    messages: ConversationMessageType[],
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
    const scrollContainerPreviousHeight = useRef<number | null>(null)
    const unreadMessageRef = useRef<HTMLDivElement>(null);
    const previousTopMessageCursorRef = useRef(topCursor);
    const previousBottomMessageCursorRef = useRef(bottomCursor);

    // Get the last message and check whether sender is logged in user, check for read status, save message index for rendering
    const lastMessage = messages.slice(-1)[0];
    const lastMessageIndex = lastMessage ? messages.length - 1 : 0;

    // Track scroll position on user scroll
    function handleScroll(event: React.UIEvent<HTMLDivElement, UIEvent>) {
        const target = event.target as HTMLDivElement;
        scrollPositionRef.current = target.scrollTop;
    }

    // Handling scroll
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            if (unreadMessageRef.current && !hasMountedRef.current) {
                // Initial load: scroll to the unread message
                container.scrollTop = unreadMessageRef.current.offsetTop - 75;
                hasMountedRef.current = true;
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

    // Get the last read message from receiver, to set the scroll to that message when logged in users opens the DMs
    const firstUnreadMessage = messages
        .filter((msg) => msg.sentBy !== loggedInUser.username)
        .find((msg) => msg.readAt === undefined);

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
                        <div ref={topRef} className='w-full flex-center mb-6 mt-2'>
                            <ClipLoader
                                color={''}
                                loading={true}
                                size={25}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={msg.id}
                            className={`min-w-[1%] break-words whitespace-normal max-w-[90%] ${msg.sentBy === loggedInUser.username ? 'self-end' : 'self-start'} ${firstUnreadMessage?.id === msg.id ? 'w-full' : ''}`}
                            ref={firstUnreadMessage?.id === msg.id ? unreadMessageRef : null}
                        >

                            {msg.sentBy === loggedInUser.username
                                ? (
                                    <div className='flex flex-col'>
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
                                                msg.status === 'sent' && index === lastMessageIndex && bottomReached
                                                    ? msg.readAt !== undefined
                                                        ? (
                                                            <p className='mt-1 mr-3 text-end text-secondary-text text-14'>
                                                                {
                                                                    formatPostDate(msg.readAt) === 'now' ? 'Seen' : `Seen ${formatPostDate(msg.readAt)} ago`
                                                                }
                                                            </p>
                                                        )
                                                        : (
                                                            <p className='mt-1 mr-3 text-end text-secondary-text text-14'>
                                                                {
                                                                    formatPostDate(msg.createdAt) === 'now' ? 'Sent' : `Sent ${formatPostDate(msg.createdAt)} ago`
                                                                }
                                                            </p>
                                                        )
                                                    : null
                                            }
                                        </div>
                                    </div>
                                )
                                : (
                                    <>
                                        {firstUnreadMessage?.id === msg.id
                                            && (
                                                <div
                                                    className={`unread-message w-full ${messages[index === 0 ? 0 : index - 1].sentBy === loggedInUser.username ? 'mt-4' : ''}`}
                                                >
                                                    <span>Unread messages</span>
                                                </div>
                                            )
                                        }

                                        <div className='flex flex-col'>
                                            <div className='flex items-center gap-2'>
                                                {msg.status === 'failed' && <CircleAlert size={20} className='text-red-400' />}
                                                <MessageBubble msg={msg} index={index} messages={messages} />
                                            </div>
                                            <div>
                                                {
                                                    index === lastMessageIndex && bottomReached && (
                                                        <p className='mt-1 ml-3 text-start text-secondary-text text-14'>
                                                            {
                                                                formatPostDate(msg.createdAt) === 'now' ? '' : `Received ${formatPostDate(msg.createdAt)} ago`
                                                            }
                                                        </p>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </>
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
