'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { Ellipsis } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SidebarUserBtn() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { loggedInUser } = useUserContext();
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const toggleMenu = (e: React.MouseEvent) => {
        console.log('open');
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
    };

    const signOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        console.log('Signing out...');
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
                <div ref={menuRef} className='user-menu'>
                    <button type='button' onClick={signOut} className='w-full text-left font-bold px-[20px] py-[5px] hover:bg-white-1'>Sign out @{loggedInUser?.username} </button>
                </div>
            }

            <button type='button'
                className='absolute top-0 left-0 w-full h-[50px] flex gap-4 items-center rounded-[25px] bg-transparent text-white-1 font-bold'
                onClick={toggleMenu}>
                <Image width={50} height={50} src={loggedInUser?.profile.profilePicture} alt='User profile' className='w-[40px] h-[40px] xl:w-[50px] xl:h-[50px] rounded-full bg-[hsl(var(--primary))]' />
                <span className='username flex flex-col items-start leading-tight text-dark-600'><span className=''>{loggedInUser?.profile.name}</span> <span className='text-dark-400 font-medium'>@{loggedInUser?.username}</span></span>
                <Ellipsis size={22} color={'#5B7083'} className='ml-auto' />
            </button>
        </div>
    )
}