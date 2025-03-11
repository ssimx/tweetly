'use client';
import ConversationMessages from "./ConversationMessages";
import ConversationInput from "./ConversationInput";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { useUserContext } from "@/context/UserContextProvider";
import { useInView } from 'react-intersection-observer';
import { ConversationMessageType, ConversationType, ErrorResponse, getErrorMessage } from 'tweetly-shared';
import { getMoreConversationMessages } from '@/actions/get-actions';
import ConversationHeader from './ConversationHeader';

export interface NewMessageType {
    id: number,
    content: string,
    createdAt: number,
    status: 'sending' | 'sent' | 'failed',
};

export default function ConversationContent({ conversation }: { conversation: ConversationType }) {
    const { loggedInUser } = useUserContext();
    const [messages, setMessages] = useState<ConversationMessageType[]>(conversation.messages);

    // receiver information
    // if both participants share username with logged in user, it's self-conversation, otherwise it's normal conversation
    const receiver = conversation.participants.filter((participant) => participant.username !== loggedInUser.username);
    const receiverInfo = receiver.length === 1 ? receiver[0] : conversation.participants[0];
    const [receiverIsTyping, setReceiverIsTyping] = useState(false);

    const [messagesCursor, setMessagesCursor] = useState<string | null>(conversation.cursor);
    const [messagesEndReached, setMessagesEndReached] = useState(conversation.end);
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldMsgs = async () => {
                if ((!messagesEndReached && messagesCursor)) {
                    try {
                        const response = await getMoreConversationMessages(conversation.id, messagesCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.messages === undefined) throw new Error('Messages property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');
                        console.log(data.messages)

                        setMessages((current) => [...data.messages as ConversationMessageType[], ...current]);
                        setMessagesCursor(data.cursor);
                        setMessagesEndReached(data.end);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setMessagesCursor(null);
                        setMessagesEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                };
            };

            fetchOldMsgs();
        }
    }, [inView, loggedInUser, conversation, messages, messagesCursor, messagesEndReached, scrollPosition]);

    // Handle new messages via sockets
    useEffect(() => {
        socket.on('message_received', (message: ConversationMessageType) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                message,
            ]);

            message.sentBy !== loggedInUser.username && socket.emit('conversation_seen_status', conversation.id, message.id);
        });

        socket.on('message_typing_status', (typingUser: null | string) => {
            typingUser === loggedInUser.username || typingUser === null ? setReceiverIsTyping(false) : setReceiverIsTyping(true);
        });

        socket.on('message_seen', (messageId) => {
            setMessages((prevMessages) =>
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

    console.log(messages, messagesCursor)

    return (
        <div className='' style={{ height: 'calc(100vh - var(--header-size))' }}>
            <ConversationHeader receiverInfo={receiverInfo} />
            <div className="h-full grid grid-cols-1 grid-rows-[1fr,1px,auto]">
                <ConversationMessages
                    messages={messages}
                    receiverInfo={receiverInfo}
                    loadingRef={ref}
                    scrollPositionRef={scrollPositionRef}
                    scrollPosition={scrollPosition}
                    endReached={messagesEndReached}
                    receiverIsTyping={receiverIsTyping}
                />

                <div className='feed-hr-line mt-auto'></div>

                <ConversationInput
                    conversationId={conversation.id}
                    setMessages={setMessages}
                    setScrollPosition={setScrollPosition}
                />
            </div>
        </div>
    )
}

