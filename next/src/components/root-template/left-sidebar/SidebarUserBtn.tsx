'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { Ellipsis } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SidebarUserBtn() {
    const { loggedInUser } = useUserContext();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);

    const signOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/logout');
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
            document.body.classList.add('overflow-y-none');
        } else {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
            document.body.classList.remove('overflow-y-none');
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
            document.body.classList.remove('overflow-y-none');
        };
    }, [menuOpen]);

    return (
        <div className='w-full h-fit mt-auto relative [&_svg]:hidden xl:w-full xl:[&_svg]:block'>
            {menuOpen && (
                <>
                    <button className='fixed top-0 left-0 w-full h-full z-40 pointer-events-auto' onClick={toggleMenu}></button>

                    <div ref={menuBtn} className='shadow-menu bg-primary-foreground overflow-hidden absolute z-[5000] w-[200px] h-fit rounded-[20px] py-[10px] mb-2 translate-y-[-125%] xl:w-[110%] xl:translate-x-[-5%] pointer-events-none [&>button]:pointer-events-auto'>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                signOut(e);
                            }}
                            className='w-full flex items-center gap-2 bg-primary-foreground text-left font-bold px-[20px] py-[10px] hover:bg-card-hover'
                        >
                            Sign out @{loggedInUser?.username}
                        </button>
                    </div>
                </>
            )}

            <button type='button'
                className='w-full h-[50px] flex-center gap-4 rounded-[25px] bg-transparent text-primary-text font-bold'
                onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(e);
                }}
            >
                <Image
                    src={loggedInUser?.profile.profilePicture}
                    alt='User profile'
                    width={50}
                    height={50}
                    className='w-[40px] h-[40px] xl:w-[50px] xl:h-[50px] rounded-full bg-transparent'
                />
                <div className='hidden w-full lg:flex flex-col items-start leading-tight truncate'>
                    <p className='' title={loggedInUser.profile.name}>{loggedInUser.profile.name}</p>
                    <p className='text-secondary-text font-medium'>@{loggedInUser.username}</p>
                </div>
                <Ellipsis size={30} strokeWidth={3} color={'#5B7083'} className='hidden lg:block ml-auto' />
            </button>
        </div>
    )
}