'use client';
import { bottomNavLinks } from '@/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import NewPostModal from './left-sidebar/NewPostModal';

export default function PhoneBottomNav() {
    const pathname = usePathname();
    const [isTransparent, setIsTransparent] = useState(false);
    const lastScrollY = useRef(0);
    const scrollingDown = useRef(true);

    useEffect(() => {
        // Initialize last scroll position
        lastScrollY.current = window.scrollY;

        const windowHeight = window.innerHeight;

        // Track the accumulated upward scroll distance
        const upScrollThreshold = windowHeight * 0.05;
        let upScrollAccumulated = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDifference = lastScrollY.current - currentScrollY;

            // Determine scroll direction
            const isScrollingUp = scrollDifference > 0;
            scrollingDown.current = !isScrollingUp;

            // Track accumulated upward scroll
            if (isScrollingUp) {
                upScrollAccumulated += scrollDifference;
            } else {
                // Reset accumulated upward scroll when direction changes to down
                upScrollAccumulated = 0;
            }

            // Apply transparency rules:
            // 1. If scrolling down and past threshold (and not at bottom) - make transparent
            // 2. If scrolled up more than upScrollThreshold, at top, or at bottom - make opaque

            // calculate whether it's the bottom
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            const scrollPosition = window.scrollY + windowHeight;
            const bottomThreshold = 100; // pixels from bottom to trigger "at bottom"

            const isAtBottom = scrollPosition >= documentHeight - bottomThreshold;


            if (scrollingDown.current && currentScrollY > windowHeight * 0.10 && !isAtBottom) {
                setIsTransparent(true);
            } else if (upScrollAccumulated >= upScrollThreshold || currentScrollY <= windowHeight * 0.10 || isAtBottom) {
                setIsTransparent(false);
            }
            // Note: if none of the conditions match, we keep the current transparency state

            // Update last known scroll position
            lastScrollY.current = currentScrollY;
        };

        // Throttle the scroll event to improve performance
        let ticking = false;
        const scrollListener = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollListener);

        return () => {
            window.removeEventListener('scroll', scrollListener);
        };
    }, []);

    return (
        <nav className={`w-full h-[75px] fixed bottom-0 right-0 pt-5 bg-gradient-to-b from-black-1/90 from-0% to-50% to-black-1 xs:hidden ${isTransparent ? 'opacity-30' : 'opacity-100'}`}>
            <div className='relative'>
                <div className='absolute top-0 right-0 translate-y-[-175%] translate-x-[-25%]'>
                    <NewPostModal />
                </div>
            </div>
            
            <div className='h-full flex gap-8 justify-evenly'>
                {bottomNavLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                        <Link key={index} href={link.route}>
                            <Icon size={24} color={pathname === link.route ? 'hsl(var(--primary))' : '#F4F3F2'} />
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}