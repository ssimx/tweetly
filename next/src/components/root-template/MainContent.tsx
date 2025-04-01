'use client';

import React, { useEffect, useRef, useState } from 'react';
import TemplateHeader from './Header';
import RightSidebar from './right-sidebar/RightSidebar';
import MobileSidebar from './MobileSidebar';
import { useAlertMessageContext } from '@/context/AlertMessageContextProvider';
import { socket } from '@/lib/socket';
import { useUserContext } from '@/context/UserContextProvider';
import LeftSidebar from './left-sidebar/LeftSidebar';
import PhoneBottomNav from './bottom-nav/PhoneBottomNav';
import { usePathname } from 'next/navigation';

export default function MainContent({ children, modals }: Readonly<{ children: React.ReactNode, modals: React.ReactNode }>) {
    const { alertMessage } = useAlertMessageContext();
    const { loggedInUser } = useUserContext();

    const pathName = usePathname();
    const [notifications, setNotifications] = useState(false);
    const [messages, setMessages] = useState(false);

    // PHONE SIDEBAR
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const mainRef = useRef<HTMLDivElement | null>(null);
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const touchStartXRef = useRef(0);
    const touchStartYRef = useRef(0);
    const isSwipingRef = useRef(false);

    const touchThreshold = 200; // Distance from the left edge to trigger open
    const closeThreshold = 50; // Minimum swipe distance to close
    const swipeThreshold = 10; // Minimum horizontal movement to consider as a swipe left/right

    // Detect swipe gestures to open/close sidebar
    useEffect(() => {
        // Helper function to get touch/pointer coordinates
        const getCoordinates = (e: TouchEvent | PointerEvent) => {
            // For touch events
            if (e instanceof TouchEvent) {
                const touch = e.touches[0] || e.changedTouches[0];
                return { x: touch.clientX, y: touch.clientY };
            }
            // For pointer events
            return { x: e.clientX, y: e.clientY };
        };

        const handleTouchStart = (e: TouchEvent | PointerEvent) => {
            const { x, y } = getCoordinates(e);
            touchStartXRef.current = x;
            touchStartYRef.current = y;
            isSwipingRef.current = false;
        };

        const handleTouchMove = (e: TouchEvent | PointerEvent) => {
            const { x, y } = getCoordinates(e);
            const deltaX = x - touchStartXRef.current;
            const deltaY = y - touchStartYRef.current;

            // When sidebar is open, only allow horizontal swipe to close
            if (sidebarOpen) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    e.preventDefault(); // Prevent vertical movement
                    isSwipingRef.current = true;
                }
                return;
            }

            // Determine if we're in a horizontal swipe for opening
            if (!isSwipingRef.current) {
                // Check if movement is primarily horizontal
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                    isSwipingRef.current = true;
                    e.preventDefault(); // Prevent default scroll
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent | PointerEvent) => {
            const { x: endX } = getCoordinates(e);
            const startX = touchStartXRef.current;
            const deltaX = endX - startX;

            // Opening sidebar (only near left edge)
            if (!sidebarOpen && startX <= touchThreshold && deltaX > closeThreshold) {
                setSidebarOpen(true);
            }

            // Closing sidebar (from anywhere when sidebar is open)
            if (sidebarOpen && deltaX < -closeThreshold) {
                setSidebarOpen(false);
            }

            // Reset swipe state
            isSwipingRef.current = false;
        };

        // Add multiple event listeners for better cross-browser support
        const events = [
            { type: 'touchstart', listener: handleTouchStart, options: { passive: false } },
            { type: 'touchmove', listener: handleTouchMove, options: { passive: false } },
            { type: 'touchend', listener: handleTouchEnd, options: { passive: false } },
        ];

        events.forEach(({ type, listener, options }) => {
            mainRef && mainRef.current && mainRef.current.addEventListener(type, listener as EventListener, options);
        });

        return () => {
            console.log('cleanup effect')

            events.forEach(({ type, listener }) => {
                window.removeEventListener(type, listener as EventListener);
            });
        };
    }, [sidebarOpen, mainRef]);

    // Prevent scrolling when sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            // Disable scrolling on body
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.top = '0';
            document.body.style.left = '0';
        } else {
            // Re-enable scrolling
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            document.body.style.left = '';
        }

        // Cleanup on unmount or state change
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            document.body.style.left = '';
        };
    }, [sidebarOpen]);

    // Set notifications status to false if user opens them
    useEffect(() => {
        if (pathName === '/notifications') setNotifications(false);
    }, [pathName]);

    // Sockets
    useEffect(() => {
        socket.connect();

        // After connecting, tell the server which users this user has notifications on for
        socket.emit('get_notifications', loggedInUser.id);

        const onNewNotification = () => {
            setNotifications(true);
        };

        const onNewMessages = () => {
            setMessages(true);
        };

        const initializeNotificationsStatus = (status: boolean) => {
            setNotifications(status);
        };

        const initializeMessagesStatus = (status: boolean) => {
            setMessages(status);
        };

        socket.on('notification_read_status', (status) => {
            initializeNotificationsStatus(status);
        });

        socket.on('message_read_status', (status) => {
            initializeMessagesStatus(status);
        });

        socket.on('new_notification', onNewNotification);
        socket.on('new_message', onNewMessages);

        return () => {
            socket.disconnect();
            socket.off('notification_read_status', initializeNotificationsStatus);
            socket.off('message_read_status', initializeNotificationsStatus);
            socket.off('new_notification', onNewNotification);
            socket.off('new_message', onNewMessages);
        };
    }, [loggedInUser]);

    return (
        <>
            {/* Normal Sidebar - Visible on bigger screens */}
            <header
                className="hidden min-w-[0px] min-h-[0px] col-start-1 col-end-2 relative
                    xs:flex xs:w-[80px]
                    xl:w-[250px]"
                role='banner'
            >
                {/* The actual sidebar - Fixed position */}
                <div className='w-full flex justify-center relative'>
                    <LeftSidebar messages={messages} notifications={notifications} />
                </div>
            </header>

            {/* Mobile Sidebar - Only visible on small screens */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 w-[75%] h-full bg-white z-[9999] border-r
                        transform transition-transform duration-300 bg-primary-foreground xs:hidden
                        ${sidebarOpen ? '' : '-translate-x-full'}`}
            >
                <MobileSidebar setSidebarOpen={setSidebarOpen} notifications={notifications} messages={messages} />
            </div>

            <main
                ref={mainRef}
                className={`h-fit min-h-svh w-full pb-[50px] xs:pb-0 xs:col-start-2 xs:col-end-3
                        flex overflow-x-clip overscroll-x-none xs:overflow-x-visible
                        transition-transform duration-300 relative
                        ${sidebarOpen ? 'translate-x-[250px]' : ''}`}
            >
                <div
                    className="mx-auto max-w-[1200px]
                        grid grid-cols-[minmax(100%,600px)]
                        xl:grid-cols-[minmax(500px,600px),1fr]"
                >

                    {/* Middle Content */}
                    <div className="h-fit min-h-screen border-x border-b border-primary-border
                            w-full max-w-[600px] mx-auto xl:mx-0"
                    >
                        <TemplateHeader setSidebarOpen={setSidebarOpen} />
                        {children}
                        {modals}
                    </div>

                    {/* Right Sidebar */}
                    <aside className="hidden xl:flex justify-center h-fit w-[400px] pt-5 px-4">
                        <RightSidebar />
                    </aside>
                    
                </div>

                {/* Mobile Sidebar overlay */}
                {sidebarOpen && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSidebarOpen(false);
                        }}
                        className="fixed inset-0 bg-black-1/90 z-[9998] xs:hidden"
                    />
                )}
            </main>

            {alertMessage !== null && (
                <div className='fixed z-[500] bottom-10 left-[50%] translate-x-[-50%] bg-primary text-white-1 font-semibold px-4 py-2 rounded-md text-center'>
                    {alertMessage}
                </div>
            )}

            {/* Mobile Navigation */}
            <PhoneBottomNav sidebarOpen={sidebarOpen} messages={messages} notifications={notifications} />
        </>
    )
}
