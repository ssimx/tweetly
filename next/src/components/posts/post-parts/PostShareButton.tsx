'use client';
import { BasicPostType, BookmarkPostType, ReplyPostType } from '@/lib/types';
import { Share, Link } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function PostShareButton({ post }: { post: BasicPostType | ReplyPostType | BookmarkPostType }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const copyProfileUrlAlert = useRef<HTMLDivElement | null>(null);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);

        if (!menuOpen) {
            // Disable interaction behind the menu when it's opened
            document.body.classList.add('disable-interaction');
        } else {
            // Re-enable interaction when the menu is closed
            document.body.classList.remove('disable-interaction');
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuBtn.current && !menuBtn.current.contains(event.target as Node)) {
            setMenuOpen(false);
            document.body.classList.remove('disable-interaction'); // Enable interaction again
        }
    };

    const handleCopyLink = () => {
        const postUrl = `http://localhost:3000/${post.author.username}/status/${post.id}`;
        navigator.clipboard.writeText(postUrl);
        setMenuOpen((prev) => !prev);
        copyProfileUrlAlert.current?.classList.toggle('hidden');

        setTimeout(() => {
            copyProfileUrlAlert.current?.classList.toggle('hidden');
        }, 3000);
    };

    useEffect(() => {
        if (menuOpen) {
            window.addEventListener('click', handleClickOutside);
        } else {
            window.removeEventListener('click', handleClickOutside);
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
                    <div className='menu-overlay' onClick={toggleMenu}></div>

                <div ref={menuBtn}
                    className='shadow-menu bg-primary-foreground border border-primary-border overflow-hidden absolute top-0 right-[0%] z-50 w-[250px] h-fit rounded-[20px] py-[10px]'>
                        <button onClick={handleCopyLink}
                            className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-card-hover'>
                            <Link size={20} className='text-primary-text' />
                            Copy link
                        </button>
                    </div>
                </>
            }

            <button className='share-btn group' onClick={toggleMenu}>
                <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                    <Share size={20} className='text-secondary-text group-hover:text-primary ml-[1px]' />
                </span>
            </button>

            <div className='profile-copy-alert hidden'
                ref={copyProfileUrlAlert} >
                Copied to clipboard
            </div>
        </div>
    )
}