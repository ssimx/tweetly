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
    const unreadMessageIdRef = useRef<string | null>(conversation.messages
        .filter((msg) => msg.sentBy !== loggedInUser.username)
        .find((msg) => msg.readAt === undefined)?.id ?? null);

    // receiver information
    // if both participants share username with logged in user, it's self-conversation, otherwise it's normal conversation
    const receiver = conversation.participants.filter((participant) => participant.username !== loggedInUser.username);
    const receiverInfo = receiver.length === 1 ? receiver[0] : conversation.participants[0];
    const [receiverIsTyping, setReceiverIsTyping] = useState(false);

    // Page visibility state
    const [isVisible, setIsVisible] = useState(true);

    // Message pagination state
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

    // Track page visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Get last seen message
    useEffect(() => {
        socket.connect();

    }, []);

    // Initialize socket connection
    useEffect(() => {
        socket.connect();

        // Clean up socket connection when component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    // Join conversation room and handle socket events
    useEffect(() => {
        // Join the conversation room
        socket.emit('join_conversation_room', conversation.id, loggedInUser.username);

        // Handler for new messages
        const handleMessageReceived = (message: ConversationMessageType) => {
            if (messagesBottomReached) {
                setMessages(prevMessages => [...prevMessages, message]);

                // If the message was sent by someone else and the page is visible, mark it as seen
                if (message.sentBy !== loggedInUser.username && isVisible) {
                    socket.emit('new_conversation_message_seen', conversation.id, message.id);
                }
            }
        };

        // Handler for typing status
        const handleTypingStatus = (typingUser: null | string) => {
            setReceiverIsTyping(typingUser !== null && typingUser !== loggedInUser.username);
        };

        // Handler for seen messages
        const handleMessageSeen = (messageId: string) => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    (msg.id === messageId && !msg.readAt)
                        ? { ...msg, readAt: new Date() }
                        : msg
                )
            );
        };

        // Handler for when someone joins the conversation
        const handleConversationSeen = (joinedUser: string) => {
            if (joinedUser === loggedInUser.username) return;

            // When other party joins, mark all messages as read
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    (msg.sentBy === loggedInUser.username && !msg.readAt)
                        ? { ...msg, readAt: new Date() }
                        : msg
                )
            );
        };

        // Register event listeners
        socket.on('message_received', handleMessageReceived);
        socket.on('message_typing_status', handleTypingStatus);
        socket.on('message_seen', handleMessageSeen);
        socket.on('conversation_seen', handleConversationSeen);

        // Clean up event listeners when component unmounts or conversation changes
        return () => {
            socket.off('message_received', handleMessageReceived);
            socket.off('message_typing_status', handleTypingStatus);
            socket.off('message_seen', handleMessageSeen);
            socket.off('conversation_seen', handleConversationSeen);
        };
    }, [conversation.id, loggedInUser.username, messagesBottomReached, isVisible]);

    // Mark unread messages as read when user is active and viewing messages
    useEffect(() => {
        if (!isVisible || messages.length === 0 || !messagesBottomReached) return;

        // Find all unread messages from other users
        const unreadMessages = messages.filter(msg =>
            msg.sentBy !== loggedInUser.username && !msg.readAt
        );

        if (unreadMessages.length > 0) {
            const latestUnreadMessage = unreadMessages[unreadMessages.length - 1];

            // Send seen status for the latest message (which implies all previous messages are seen too)
            socket.emit('conversation_seen_status', conversation.id, latestUnreadMessage.id);

            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    (unreadMessages.some(unread => unread.id === msg.id))
                        ? { ...msg, readAt: new Date() }
                        : msg
                )
            );
        }
    }, [messages, messagesBottomReached, isVisible, conversation.id, loggedInUser.username]);

    return (
        <div className='h-dvh max-h-dvh overflow-y-hidden'>
            <ConversationHeader receiverInfo={receiverInfo} />
            <div className="h-full grid grid-cols-1 grid-rows-[1fr,1px,auto]">
                <ConversationMessages
                    messages={messages}
                    unreadMessageId={unreadMessageIdRef.current}
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

