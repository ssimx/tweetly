'use client';
import { leftSidebarLinks } from '@/constants';
import Link from 'next/link';
import Image from 'next/image';
import SidebarUserBtn from './SidebarUserBtn';
import NewPostModal from './NewPostModal';
import LeftSidebarLink from './LeftSidebarLink';
import TweetlyLogoWhite from '@/assets/white.png';
import TweetlyLogoBlack from '@/assets/black.png';
import { useDisplayContext } from '@/context/DisplayContextProvider';

export default function LeftSidebar({ messages, notifications }: { messages: boolean, notifications: boolean }) {
    const { savedTheme } = useDisplayContext();

    return (
        <nav className='hidden fixed z-[1000] top-0 h-full pt-4 pb-6
                        xs:flex xs:flex-col xs:gap-12 xs:[&_p]:hidden xs:[&_span]:hidden
                        xl:items-start xl:[&_p]:block xl:[&_span]:flex xl:w-[200px]'
        >
            <Link href='/'>
                <Image src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite} alt='Tweetly logo' width='30' height='30' className='mx-auto' />
            </Link>
            <div className='flex flex-col mx-auto'>
                {leftSidebarLinks.map((link) => (
                    <LeftSidebarLink
                        key={link.label}
                        link={link}
                        messages={messages}
                        notifications={notifications} />
                ))}
            </div>

            <div className='w-full flex justify-center z-10'>
                <NewPostModal />
            </div>

            <SidebarUserBtn />
        </nav>
    )
}

