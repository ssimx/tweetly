'use client';
import { leftSidebarLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SidebarUserBtn from './SidebarUserBtn';
import NewPostModal from './NewPostModal';
import { useUserContext } from '@/context/UserContextProvider';

export default function LeftSidebar() {
    const pathname = usePathname();
    const { loggedInUser } = useUserContext();

    return (
        <nav className='left-sidebar'>
            <Link href='/'>
                <Image src='/blackLogo.png' alt='Tweetly logo' width='30' height='30' className='mx-auto' />
            </Link>
            <div className='left-sidebar-links'>
                {leftSidebarLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                        <Link key={index} href={link.route === '/profile' ? `/${loggedInUser.username}` : link.route} className='flex gap-4 items-center'>
                            <Icon className='icon'
                                color={pathname === link.route ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                            />
                            <p className={`${pathname === link.route && 'font-bold'} text-20`} >{link.label}</p>
                        </Link>
                    )
                })}
            </div>

            <NewPostModal />

            <SidebarUserBtn />
        </nav>
    )
}

