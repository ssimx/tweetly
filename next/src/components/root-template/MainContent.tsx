'use client';

import React, { useEffect, useRef, useState } from 'react';
import TemplateHeader from './Header';
import RightSidebar from './right-sidebar/RightSidebar';
import MobileSidebar from './MobileSidebar';
import PhoneBottomNav from './PhoneBottomNav';
import { useAlertMessageContext } from '@/context/AlertMessageContextProvider';

export default function MainContent({ children, modals }: Readonly<{ children: React.ReactNode, modals: React.ReactNode }>) {
    const { alertMessage } = useAlertMessageContext();

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
            window.addEventListener(type, listener as EventListener, options);
        });

        return () => {
            events.forEach(({ type, listener }) => {
                window.removeEventListener(type, listener as EventListener);
            });
        };
    }, [sidebarOpen]);

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

    return (
        <>
            {/* Mobile Sidebar - Only visible on small screens */}
            {sidebarOpen && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setSidebarOpen(false);
                    }}
                    className="fixed inset-0 bg-black-1/90 z-[9998] xs:hidden"
                />
            )}

            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 w-[75%] h-full bg-white z-[9999] border-r
                        transform transition-transform duration-300 bg-primary-foreground xs:hidden
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >

                <MobileSidebar setSidebarOpen={setSidebarOpen} />
            </div>

            <main
                ref={mainRef}
                className={`h-fit min-h-svh w-full pb-[50px] xs:pb-0 xs:col-start-2 xs:col-end-3
                        flex overflow-x-hidden overscroll-x-none xs:overflow-x-visible touch-none
                        transition-transform duration-300 relative
                        ${sidebarOpen ? 'translate-x-[250px]' : 'translate-x-0'}`}
            >
                <div
                    className="grid grid-cols-[minmax(100%,600px)]
                        xl:grid-cols-[minmax(500px,600px),1fr] mx-auto max-w-[1200px]"
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
                    <aside className="hidden lg:hidden xl:flex justify-center h-fit w-[400px] pt-5 px-4">
                        <RightSidebar />
                    </aside>

                </div>
            </main>

            {alertMessage !== null && (
                <div className='fixed z-[500] bottom-10 left-[50%] translate-x-[-50%] bg-primary text-white-1 font-semibold px-4 py-2 rounded-md'>
                    {alertMessage}
                </div>
            )}

            {/* Mobile Navigation */}
            <PhoneBottomNav sidebarOpen={sidebarOpen} />
        </>
    )
}
