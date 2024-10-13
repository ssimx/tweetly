'use client';
import { Ellipsis, Link, Ban, CircleOff } from 'lucide-react';
import { SetStateAction, useEffect, useRef, useState } from 'react';

interface MenuType {
    user: string,
    isBlockedByTheUser: boolean,
    setIsBlockedByTheUser: React.Dispatch<SetStateAction<boolean>>,

    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<SetStateAction<boolean>>,
    setFollowersCount: React.Dispatch<SetStateAction<number>>,

    isFollowingTheUser: boolean,
    setIsFollowingTheUser: React.Dispatch<SetStateAction<boolean>>,
    setFollowingCount: React.Dispatch<SetStateAction<number>>,
};

export default function ProfileMenuBtn({
    user,
    isBlockedByTheUser,
    setIsBlockedByTheUser,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    setFollowersCount,
    isFollowingTheUser,
    setIsFollowingTheUser,
    setFollowingCount,
}: MenuType) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const blockBtn = useRef<HTMLButtonElement | null>(null);
    const copyProfileUrlAlert = useRef<HTMLDivElement | null>(null);

    const toggleMenu = (e: React.MouseEvent) => {
        console.log('open');
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

    const handleCopyLink = () => {
        const url = window.location.origin;
        const profileUrl = `${url}/${user}`;
        navigator.clipboard.writeText(profileUrl);
        setMenuOpen((prev) => !prev);
        copyProfileUrlAlert.current?.classList.toggle('hidden');

        setTimeout(() => {
            copyProfileUrlAlert.current?.classList.toggle('hidden');
        }, 3000);
    };

    const handleBlock = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (isBlockedByTheUser) {
            try {
                const response = await fetch(`/api/users/removeBlock/${user}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error('User is not blocked');
                    return;
                }

                setIsBlockedByTheUser((prev) => !prev);
                setMenuOpen(false);
            } catch (error) {
                console.error('Something went wrong');
            }
        } else {
            try {
                const response = await fetch(`/api/users/block/${user}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error('User is already blocked');
                    return;
                }

                setIsBlockedByTheUser((prev) => !prev);
                isFollowedByTheUser && setFollowersCount((prev) => prev - 1);
                isFollowedByTheUser && setIsFollowedByTheUser(false);
                isFollowingTheUser && setFollowingCount((prev) => prev - 1);
                isFollowingTheUser && setIsFollowingTheUser(false);
                setMenuOpen(false);
            } catch (error) {
                console.error('Something went wrong');
            }
        }
    };

    return (
        <div className='profile-menu'>
            {menuOpen &&
                <>
                    <div className='menu-overlay' onClick={toggleMenu}></div>

                    <div ref={menuBtn} className='profile-opened-menu'>
                        <button onClick={handleCopyLink}
                            className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-white-1'>
                            <Link size={20} className='text-black-1' />
                            Copy link to profile
                        </button>
                        {
                            isBlockedByTheUser
                                ? (
                                    <button className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-white-1' onClick={handleBlock} ref={blockBtn}>
                                        <CircleOff size={20} className='text-black-1' />
                                        Unblock @{user}
                                    </button>
                                )
                                : <button className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-white-1' onClick={handleBlock} ref={blockBtn}>
                                    <Ban size={20} className='text-black-1' />
                                    Block @{user}
                                </button>
                        }
                    </div>
                </>
            }

            <button className='profile-menu-btn'
                onClick={toggleMenu}>
                <Ellipsis size={20} className='text-black-1' />
            </button>

            <div className='profile-copy-alert hidden'
                ref={copyProfileUrlAlert} >
                Copied to clipboard
            </div>
        </div>
    )
}