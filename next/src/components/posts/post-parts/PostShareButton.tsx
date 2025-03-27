'use client';
import { Share, Link } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BasePostDataType } from 'tweetly-shared';
import { RemoveScroll } from 'react-remove-scroll';

export default function PostShareButton({ post }: { post: BasePostDataType }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const copyProfileUrlAlert = useRef<HTMLDivElement | null>(null);

    const handleCopyLink = async () => {
        const postUrl = `http://192.168.1.155:3000/${post.author.username}/status/${post.id}`;
        try {
            // Attempt to use the modern Clipboard API
            await navigator.clipboard.writeText(postUrl);
            // Success: toggle menu and show notification
            setMenuOpen((prev) => !prev);
            copyProfileUrlAlert.current?.classList.toggle('hidden');
            setTimeout(() => {
                copyProfileUrlAlert.current?.classList.toggle('hidden');
            }, 3000);
        } catch (err) {
            console.error('Clipboard API failed, trying fallback: ', err);
            // Fallback to document.execCommand
            const textArea = document.createElement('textarea');
            textArea.value = postUrl;
            // Ensure the textarea is not visible
            textArea.style.position = 'fixed';
            textArea.style.top = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                // Success: toggle menu and show notification
                setMenuOpen((prev) => !prev);
                copyProfileUrlAlert.current?.classList.toggle('hidden');
                setTimeout(() => {
                    copyProfileUrlAlert.current?.classList.toggle('hidden');
                }, 3000);
            } catch (fallbackErr) {
                console.error('Fallback failed: ', fallbackErr);
                // Optionally, notify the user of the failure
                alert('Failed to copy the link. Please copy it manually.');
            } finally {
                // Clean up
                document.body.removeChild(textArea);
            }
        }
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
                    <RemoveScroll>
                        <button className='fixed top-0 left-0 w-full h-full z-40 pointer-events-auto' onClick={toggleMenu}></button>
                    </RemoveScroll>

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
                className='share-btn group'
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

            <div className='fixed z-[500] bottom-10 left-[50%] translate-x-[-50%] bg-primary text-white-1 font-semibold px-4 py-2 rounded-md hidden'
                ref={copyProfileUrlAlert} >
                Copied to clipboard
            </div>
        </div>
    )
}