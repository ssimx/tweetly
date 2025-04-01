'use client';
import { Share, Link } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BasePostDataType } from 'tweetly-shared';
import { RemoveScroll } from 'react-remove-scroll';
import { useAlertMessageContext } from '@/context/AlertMessageContextProvider';
import { usePathname } from 'next/navigation';

export default function PostShareButton({ post }: { post: BasePostDataType }) {
    const { setAlertMessage } = useAlertMessageContext();
    const pathName = usePathname();

    const [menuOpen, setMenuOpen] = useState(false);
    const [showScrollbar, setShowScrollbar] = useState(true);
    const menuBtn = useRef<HTMLDivElement | null>(null);

    const handleCopyLink = () => {
        const postUrl = `http://192.168.1.155:3000/${post.author.username}/status/${post.id}`;
        navigator.clipboard.writeText(postUrl);
        setMenuOpen((prev) => !prev);
        setAlertMessage('Copied to clipboard');
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuBtn.current && !menuBtn.current.contains(event.target as Node)) {
            setMenuOpen(false);
            document.body.classList.remove('disable-interaction'); // Enable interaction again
        }
    };

    // For tracking whether overlay is opened, to hide background scrollbar
    useEffect(() => {
        if (pathName.includes('photo')) {
            setShowScrollbar(false);
        } else {
            setShowScrollbar(true);
        }
    }, [pathName]);

    useEffect(() => {
        if (menuOpen) {
            window.addEventListener('click', handleClickOutside);
            document.body.classList.add('disable-interaction');
        } else {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
        };
    }, [menuOpen]);

    return (
        <div className='relative flex-center'>
            {menuOpen &&
                <>
                    {showScrollbar === false
                        ? (
                            <button className='fixed top-0 left-0 w-full h-full z-40 pointer-events-auto bla' onClick={toggleMenu}></button>
                        )
                        : (
                            <RemoveScroll>
                                <button className='fixed top-0 left-0 w-full h-full z-40 pointer-events-auto' onClick={toggleMenu}></button>
                            </RemoveScroll>
                        )}

                    <div
                        ref={menuBtn}
                        className='shadow-menu bg-primary-foreground border border-primary-border overflow-hidden absolute top-0 right-[0%] z-50 w-[250px] h-fit rounded-[20px] py-[10px] pointer-events-none [&>button]:pointer-events-auto'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleCopyLink();
                            }}
                            className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-card-hover'>
                            <Link size={20} className='text-primary-text' />
                            Copy link
                        </button>
                    </div>
                </>
            }

            <button
                className='flex-center h-[35px] w-[35px] rounded-full hover:bg-blue-1/10 group'
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleMenu(e);
                }}
            >
                <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                    <Share size={20} className='text-secondary-text group-hover:text-primary ml-[1px]' />
                </span>
            </button>

        </div>
    )
}