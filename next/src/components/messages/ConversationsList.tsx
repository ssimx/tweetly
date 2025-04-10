'use client';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import ConversationCard from "./ConversationCard";
import { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ConversationCardType, ErrorResponse, getErrorMessage } from 'tweetly-shared';
import ConversationsNoContent from './ConversationsNoContent';
import { getMoreConversations } from '@/actions/get-actions';
import ClipLoader from 'react-spinners/ClipLoader';

export default function ConversationsList({ initialConversations, cursor, end }: { initialConversations: ConversationCardType[] | null, cursor: string | null, end: boolean }) {
    const [conversations, setConversations] = useState(initialConversations);
    const commandEmptyRef = useRef<HTMLDivElement>(null);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [conversationsCursor, setConversationsCursor] = useState<string | null>(cursor);
    const [conversationsEndReached, setConversationsEndReached] = useState<boolean>(end);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldConversations = async () => {
                if ((!conversationsEndReached && conversationsCursor)) {
                    try {
                        const response = await getMoreConversations(conversationsCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.conversations === undefined) throw new Error('Conversations property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setConversations((current) => [...current as ConversationCardType[], ...data.conversations as ConversationCardType[]]);
                        setConversationsCursor(data.cursor);
                        setConversationsEndReached(data.end);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setConversationsCursor(null);
                        setConversationsEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                };
            }

            fetchOldConversations();
        }
    }, [inView, conversationsCursor, conversationsEndReached, scrollPosition]);

    useEffect(() => {
        // Track scroll position on user scroll with throttling
        let ticking = false;

        function handleScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    scrollPositionRef.current = window.scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollPositionRef]);

    useEffect(() => {
        // there are issues with CommandEmpty being visible on component mount for quick second
        // so the only solution is to hide the div and unhide after mount
        commandEmptyRef.current && commandEmptyRef.current.classList.remove('hidden');
    }, [conversations]);

    return (
        <Command className=''>
            <div className='p-2'>
                <CommandInput placeholder="Search Direct Messages" />
            </div>
            <CommandList>
                <CommandGroup className=''>

                    {conversations === undefined
                        ? (
                            <div className='w-full flex justify-center mt-6'>
                                <ClipLoader
                                    className='loading-spinner'
                                    loading={true}
                                    size={25}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        )
                        : conversations && conversations.length
                            ? (
                                conversations.map((conversation, index) => (
                                    <CommandItem key={index} className='w-full'>
                                        <div className='w-full'>
                                            <ConversationCard conversation={conversation} />
                                        </div>
                                    </CommandItem>
                                ))
                            )
                            : conversations === null
                                ? <div>Something went wrong</div>
                                : conversations && !conversations.length && (
                                    <div className='hidden' ref={commandEmptyRef}>
                                        <CommandEmpty asChild>
                                            <ConversationsNoContent />
                                        </CommandEmpty>
                                    </div>
                                )
                    }

                    {!conversationsEndReached && (
                        <div ref={ref} className='w-full flex justify-center mt-6'>
                            <ClipLoader
                                className='loading-spinner'
                                loading={true}
                                size={25}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                    )}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}
