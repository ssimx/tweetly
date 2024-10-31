'use client';
import { ConversationLastMessageType } from "@/app/(root)/messages/page";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import ConversationCard from "./ConversationCard";
import { useRef, useEffect } from "react";

export default function SearchInput({ conversations }: { conversations: ConversationLastMessageType[] }) {
    const commandEmptyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // there are issues with CommandEmpty being visible on component mount for quick second
        // so the only solution is to hide the div and unhide after mount
        commandEmptyRef.current && commandEmptyRef.current.classList.remove('hidden');
    }, []);
    
    return (
        <Command>
            <div className='p-2'>
                <CommandInput placeholder="Search Direct Messages" />
            </div>
            <CommandList>
                <div className='hidden' ref={commandEmptyRef}>
                    <CommandEmpty>No results found.</CommandEmpty>
                </div>
                <CommandGroup>
                    {conversations.map((item, index) => (
                        <CommandItem key={index} className='w-full'>
                            <div className='w-full'>
                                <ConversationCard convoId={item.conversationId} convo={item.lastMessage} />
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}
