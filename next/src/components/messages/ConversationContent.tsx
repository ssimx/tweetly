'use client';
import ConversationMessages from "./ConversationMessages";
import ConversationInput from "./ConversationInput";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { useUserContext } from "@/context/UserContextProvider";
import { useInView } from 'react-intersection-observer';
import { ConversationMessageType, ConversationType, ErrorResponse, getErrorMessage } from 'tweetly-shared';
import { getNewerConversationMessages, getOlderConversationMessages } from '@/actions/get-actions';
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

    const [isFetchingMoreMessages, setIsFetchingMoreMessages] = useState(false);
    const [messagesTopCursor, setMessagesTopCursor] = useState<string | null>(conversation.topCursor);
    const [messagesTopReached, setMessagesTopReached] = useState(conversation.topReached);
    const [messagesBottomCursor, setMessagesBottomCursor] = useState<string | null>(conversation.bottomCursor);
    const [messagesBottomReached, setMessagesBottomReached] = useState(conversation.bottomReached);
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);

    // Top observer
    const { ref: topRef, inView: topInView } = useInView({
        threshold: 0.5,
        fallbackInView: false,
    });

    // Bottom observer
    const { ref: bottomRef, inView: bottomInView } = useInView({
        threshold: 0.5,
        fallbackInView: false,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (topInView && scrollPositionRef.current !== scrollPosition && !isFetchingMoreMessages) {
            const fetchOldMsgs = async () => {
                if ((!messagesTopReached && messagesTopCursor)) {
                    try {
                        setIsFetchingMoreMessages(true);
                        const response = await getOlderConversationMessages(conversation.id, messagesTopCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.messages === undefined) throw new Error('Messages property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setMessages((current) => [...data.messages as ConversationMessageType[], ...current]);
                        setMessagesTopCursor(data.cursor);
                        setMessagesTopReached(data.topReached);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setMessagesTopCursor(null);
                        setMessagesTopReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                        setIsFetchingMoreMessages(false);
                    }
                };
            };

            fetchOldMsgs();
        } else if (bottomInView && scrollPositionRef.current !== scrollPosition && !isFetchingMoreMessages) {
            const fetchNewMsgs = async () => {
                if ((!messagesBottomReached && messagesBottomCursor)) {
                    try {
                        setIsFetchingMoreMessages(true);
                        const response = await getNewerConversationMessages(conversation.id, messagesBottomCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.messages === undefined) throw new Error('Messages property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setMessages((current) => [...current, ...data.messages as ConversationMessageType[],]);
                        setMessagesBottomCursor(data.cursor);
                        setMessagesBottomReached(data.bottomReached);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setMessagesBottomCursor(null);
                        setMessagesBottomReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                        setIsFetchingMoreMessages(false);
                    }
                };
            };

            fetchNewMsgs();
        }
    }, [
        topInView,
        bottomInView,
        scrollPosition,
        loggedInUser,
        conversation,
        messages,
        messagesTopCursor,
        messagesTopReached,
        messagesBottomCursor,
        messagesBottomReached,
        isFetchingMoreMessages
    ]);

    // Handle new messages via sockets
    useEffect(() => {
        socket.on('message_received', (message: ConversationMessageType) => {
            if (message.sentBy !== loggedInUser.username && messagesBottomReached) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    message,
                ]);

                socket.emit('conversation_seen_status', conversation.id, message.id);
            }
        });

        socket.on('message_typing_status', (typingUser: null | string) => {
            typingUser === loggedInUser.username || typingUser === null ? setReceiverIsTyping(false) : setReceiverIsTyping(true);
        });

        socket.on('message_seen', (messageId) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    (msg.id === messageId && !msg.readAt)
                        ? { ...msg, readAt: new Date() }
                        : msg
                )
            );
        });

        return () => {
            socket.off('message_received');
            socket.off('message_typing_status');
            socket.off('message_seen');
        };
    }, [conversation, messagesBottomReached, loggedInUser]);

    // Connect to conversation room
    useEffect(() => {
        socket.connect();
        socket.emit('join_conversation_room', conversation.id, loggedInUser.username);

        socket.on('conversation_seen', (joinedUser) => {
            if (loggedInUser.username === joinedUser) return;

            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    (msg.sentBy === loggedInUser.username && !msg.readAt)
                        ? { ...msg, readAt: new Date() }
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
        <div className='' style={{ height: 'calc(100vh - var(--header-size))' }}>
            <ConversationHeader receiverInfo={receiverInfo} />
            <div className="h-full grid grid-cols-1 grid-rows-[1fr,1px,auto]">
                <ConversationMessages
                    messages={messages}
                    receiverInfo={receiverInfo}
                    topCursor={messagesTopCursor}
                    topRef={topRef}
                    topReached={messagesTopReached}
                    bottomCursor={messagesBottomCursor}
                    bottomRef={bottomRef}
                    bottomReached={messagesBottomReached}
                    scrollPositionRef={scrollPositionRef}
                    scrollPosition={scrollPosition}
                    receiverIsTyping={receiverIsTyping}
                />

                <div className='feed-hr-line mt-auto'></div>

                <ConversationInput
                    conversationId={conversation.id}
                    setMessages={setMessages}
                    messagesBottomReached={messagesBottomReached}
                    setScrollPosition={setScrollPosition}
                />
            </div>
        </div>
    )
}

