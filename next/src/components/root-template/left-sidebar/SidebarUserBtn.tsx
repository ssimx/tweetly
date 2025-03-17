'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { Ellipsis } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SidebarUserBtn() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { loggedInUser } = useUserContext();
    const menuRef = useRef<HTMLButtonElement | null>(null);
    const router = useRouter();

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
    };

    const signOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/logout');
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        if (menuOpen) {
            window.addEventListener('click', handleClickOutside);
        } else {
            window.removeEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside); // Cleanup on unmount
        };
    }, [menuOpen]);

    return (
        <div className='user-btn'>
            {menuOpen &&
                <button ref={menuRef} type='button' onClick={signOut} className='user-menu w-full h-full text-left font-bold border border-primary-border hover:bg-card-hover'>Sign out @{loggedInUser?.username} </button>
            }

            <button type='button'
                className='w-full h-[50px] flex gap-4 items-center rounded-[25px] bg-transparent text-primary-text font-bold'
                onClick={toggleMenu}>
                <Image width={50} height={50} src={loggedInUser?.profile.profilePicture} alt='User profile' className='w-[40px] h-[40px] xl:w-[50px] xl:h-[50px] rounded-full bg-[hsl(var(--primary))]' />
                <span className='flex flex-col items-start leading-tight'><span className=''>{loggedInUser?.profile.name}</span> <span className='text-secondary-text font-medium'>@{loggedInUser?.username}</span></span>
                <Ellipsis size={22} color={'#5B7083'} className='ml-auto' />
            </button>
        </div>
    )
}