'use client';
import { ConversationType, MessageType, ReceiverType } from "@/app/(root)/messages/[conversationId]/page";
import ConversationMessages from "./ConversationMessages";
import ConversationInput from "./ConversationInput";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { useUserContext } from "@/context/UserContextProvider";
import { useInView } from 'react-intersection-observer';

export interface NewMessageType {
    id: number,
    content: string,
    createdAt: number,
    status: 'sending' | 'sent' | 'failed',
};

export interface AllMessagesType {
    id: string,
    content: string,
    createdAt: number,
    sender: boolean,
    readStatus: boolean,
    status: 'sending' | 'sent' | 'failed',
};

export default function ConversationContent({ receiverInfo, conversation }: { receiverInfo: ReceiverType, conversation: ConversationType }) {
    const { loggedInUser } = useUserContext();
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);

    const [allMessagesOrdered, setAllMessagesOrdered] = useState<AllMessagesType[]>([]);
    const [cursor, setCursor] = useState<string>('');
    const [endReached, setEndReached] = useState(conversation.end);
    const [receiverIsTyping, setReceiverIsTyping] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && !endReached && scrollPositionRef.current !== scrollPosition) {
            const fetchOldMsgs = async () => {
                const response = await fetch(`/api/conversations/${conversation.id}?cursor=${cursor}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache',
                });
                const { messages, end }: { messages: MessageType[], end: boolean } = await response.json();

                if (messages.length === 0 && end === true) {
                    setEndReached(true);
                    return;
                }

                const allMsgsOrdered = messages
                    .map((msg) => {
                        const loggedInUserIsSender: boolean = msg.sender.username === loggedInUser.username;
                        return {
                            id: msg.id,
                            content: msg.content,
                            createdAt: new Date(msg.createdAt).getTime(),
                            sender: loggedInUserIsSender,
                            readStatus: msg.readStatus,
                            status: 'sent'
                        }
                    })
                    .sort((a, b) => a.createdAt - b.createdAt);

                setAllMessagesOrdered((currentMessages) => [...allMsgsOrdered as AllMessagesType[], ...currentMessages]);
                setCursor(allMsgsOrdered[0].id);
                setScrollPosition(scrollPositionRef.current);
            };

            fetchOldMsgs();
        }
    }, [inView, conversation, cursor, loggedInUser, endReached, scrollPosition]);

    // Handle new messages via sockets
    useEffect(() => {
        socket.on('message_received', (message: {
            id: string,
            content: string,
            createdAt: string,
            senderId: number,
            receiverId: number,
        }) => {
            setAllMessagesOrdered((prevMessages) => [
                ...prevMessages,
                { ...message, createdAt: new Date(message.createdAt).getTime(), sender: message.senderId === loggedInUser.id ? true : false, readStatus: message.senderId === loggedInUser.id ? false : true, status: 'sent' }
            ]);

            message.senderId !== loggedInUser.id && socket.emit('conversation_seen_status', conversation.id, message.id);
        });

        socket.on('message_typing_status', (typingUser: null | string ) => {
            typingUser === loggedInUser.username || typingUser === null ? setReceiverIsTyping(false) : setReceiverIsTyping(true);
        });

        socket.on('message_seen', (messageId) => {
            setAllMessagesOrdered((prevMessages) =>
                prevMessages.map((msg) =>
                    (msg.id === messageId || (messageId === null && msg === prevMessages[prevMessages.length - 1]))
                        ? { ...msg, readStatus: true }
                        : msg
                )
            );
        });

        return () => {
            socket.off('message_received');
            socket.off('message_typing_status');
            socket.off('message_seen');
        };
    }, [conversation, loggedInUser]);

    // Connect to conversation room
    useEffect(() => {
        socket.connect();
        socket.emit('join_conversation_room', conversation.id, loggedInUser.username);

        // Initial message mapping and setting cursor
        if (conversation.messages.length !== 0) {
            const allMsgsOrdered = conversation.messages
                .map((msg) => ({
                    id: msg.id,
                    content: msg.content,
                    createdAt: new Date(msg.createdAt).getTime(),
                    sender: msg.sender.username === loggedInUser.username,
                    readStatus: msg.readStatus,
                    status: 'sent'
                }))
                .sort((a, b) => a.createdAt - b.createdAt) as AllMessagesType[];

            setAllMessagesOrdered(allMsgsOrdered);
            setCursor(allMsgsOrdered[0].id);
        }

        socket.on('conversation_seen', (joinedUser) => {
            if (loggedInUser.username === joinedUser) return;

            setAllMessagesOrdered((prevMessages) =>
                prevMessages.map((msg) =>
                    (msg.sender === true)
                        ? { ...msg, readStatus: true }
                        : msg
                )
            );
        });

        return () => {
            socket.disconnect();
            socket.off('conversation_seen');
        };
    }, [conversation, loggedInUser]);

    return (
        <div className="h-full grid grid-cols-1 grid-rows-conversation-content">
            <ConversationMessages
                allMessagesOrdered={allMessagesOrdered}
                receiverInfo={receiverInfo}
                loadingRef={ref}
                scrollPositionRef={scrollPositionRef}
                scrollPosition={scrollPosition}
                endReached={endReached}
                receiverIsTyping={receiverIsTyping}
            />
            <div className='feed-hr-line mt-auto'></div>
            <ConversationInput
                conversationId={conversation.id}
                setAllMessagesOrdered={setAllMessagesOrdered}
                setScrollPosition={setScrollPosition}
            />
        </div>
    )
}

