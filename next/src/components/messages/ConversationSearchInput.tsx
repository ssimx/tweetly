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
import { ConversationsListType } from "@/lib/types";

export default function ConversationSearchInput({ messages }: { messages: ConversationsListType }) {
    const [convos, setConvos] = useState(messages.conversations);
    const commandEmptyRef = useRef<HTMLDivElement>(null);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [conversationCursor, setConversationCursor] = useState<string>();
    const [endReached, setEndReached] = useState(messages.end);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    useEffect(() => {
        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollPositionRef]);

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && !endReached) {
            const fetchOldConversations = async () => {
                const response = await fetch(`api/conversations?cursor=${conversationCursor}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache',
                });
                const { conversations, end } = await response.json() as ConversationsListType;

                if (conversations.length === 0 && end === true) {
                    setEndReached(true);
                    return;
                }

                setConvos((currentConvos) => [...currentConvos, ...conversations]);

                setConversationCursor(conversations[conversations.length === 0 ? 0 : conversations.length - 1].id);
                setScrollPosition(scrollPositionRef.current);
            }

            fetchOldConversations();
        }
    }, [inView, conversationCursor, endReached, scrollPosition]);
    
    useEffect(() => {
        // there are issues with CommandEmpty being visible on component mount for quick second
        // so the only solution is to hide the div and unhide after mount
        commandEmptyRef.current && commandEmptyRef.current.classList.remove('hidden');
    }, [messages]);
    
    return (
        <Command>
            <div className='p-2'>
                <CommandInput placeholder="Search Direct Messages" />
            </div>
            <CommandList>
                <CommandGroup className=''>
                    <div className='hidden' ref={commandEmptyRef}>
                        <CommandEmpty>No messages found.</CommandEmpty>
                    </div>

                    { convos?.map((item, index) => (
                        <CommandItem key={index} className='w-full'>
                            <div className='w-full'>
                                <ConversationCard convo={item} />
                            </div>
                        </CommandItem>
                    ))}

                    {!endReached && (
                        <div ref={ref}>
                            <p>Loading...</p>
                        </div>
                    )}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}
