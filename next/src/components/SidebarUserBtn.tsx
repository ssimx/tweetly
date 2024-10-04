'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { Ellipsis } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SidebarUserBtn() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user } = useUserContext();
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

        try {
            const response = await fetch('/api/logout', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
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
                    <button type='button' onClick={signOut} className='w-full text-left font-bold'>Sign out @{user?.username} </button>
                </div>
            }

            <button type='button'
                className='absolute top-0 left-0 w-full h-[50px] flex gap-4 items-center rounded-[25px] bg-transparent text-white-1 font-bold'
                onClick={toggleMenu}>
                <Image width={50} height={50} src={`http://localhost:3001/public/profilePictures/${user?.profile.profilePicture}`} alt='User profile' className='rounded-[50%] bg-[hsl(var(--primary))]' />
                <span className='username flex flex-col items-start leading-tight text-dark-600'><span className=''>{user?.profile.name}</span> <span className='text-dark-400 font-medium'>@{user?.username}</span></span>
                <Ellipsis size={22} color={'#5B7083'} className='ml-auto' />
            </button>
        </div>
    )
}