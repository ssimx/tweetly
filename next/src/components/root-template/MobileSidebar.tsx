'use client';

import { useUserContext } from '@/context/UserContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { leftSidebarLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function MobileSidebar({ setSidebarOpen, notifications, messages }: { setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>, notifications: boolean, messages: boolean }) {
    const { loggedInUser } = useUserContext();
    const pathName = usePathname();

    return (
        <div className='fixed left-0 top-0 w-full h-full flex flex-col'>
            <div className='flex flex-col gap-2 p-4'>
                <Link href={`/${loggedInUser.username}`} className='group w-fit' onClick={() => setSidebarOpen(false)}>
                    <Image
                        src={loggedInUser.profile.profilePicture}
                        alt='User profile picture'
                        width={50} height={50}
                        className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                </Link>

                <div className='w-full flex flex-col items-start leading-tight truncate'>
                    <p className='font-bold text-[1.15rem]' title={loggedInUser.profile.name}>{loggedInUser.profile.name}</p>
                    <p className='text-secondary-text'>@{loggedInUser.username}</p>
                </div>

                <div className='flex gap-4'>
                    <Link
                        href={`/${loggedInUser.username}/following`}
                        className='hover:underline'
                        onClick={() => setSidebarOpen(false)}
                    >
                        <p className='font-bold'>
                            {loggedInUser.following}
                            <span className='text-secondary-text font-normal'> Following</span></p>
                    </Link>
                    <Link
                        href={`/${loggedInUser.username}/followers`}
                        className='hover:underline'
                        onClick={() => setSidebarOpen(false)}
                    >
                        <p className='font-bold'>
                            {loggedInUser.followers}
                            <span className='text-secondary-text font-normal'> Followers</span></p>
                    </Link>
                </div>
            </div>

            <div className='flex flex-col'>
                {leftSidebarLinks.map((link) => {
                    const Icon = link.icon;

                    if (link.label === 'Notifications') {
                        return (
                            <Link
                                key={link.label}
                                href={link.route === '/profile' ? `/${loggedInUser.username}` : link.route}
                                className='w-full flex gap-4 items-center hover:bg-card-hover p-4'
                                onClick={() => setSidebarOpen(false)}
                            >
                                <div className='relative flex items-center gap-4'>
                                    {notifications === true && (
                                        <div className='absolute right-0 top-0 translate-y-[-40%] translate-x-[150%] z-10 w-[12px] h-[12px] bg-primary rounded-full'></div>
                                    )}
                                    <Icon
                                        className='icon'
                                        color={pathName === link.route ? 'hsl(var(--primary))' : 'hsl(var(--primary-text-color))'}
                                        strokeWidth={3}
                                    />
                                    <p className={`${pathName === link.route && 'font-bold'} text-20`} >{link.label}</p>
                                </div>
                            </Link>
                        )
                    }

                    if (link.label === 'Messages') {
                        return (
                            <Link
                                key={link.label}
                                href={link.route === '/profile' ? `/${loggedInUser.username}` : link.route}
                                className='w-full flex gap-4 items-center hover:bg-card-hover p-4'
                                onClick={() => setSidebarOpen(false)}
                            >
                                <div className='relative flex items-center gap-4'>
                                    {messages === true && (
                                        <div className='absolute right-0 top-0 translate-y-[-40%] translate-x-[150%] z-10 w-[12px] h-[12px] bg-primary rounded-full'></div>
                                    )}
                                    <Icon
                                        className='icon'
                                        color={pathName === link.route ? 'hsl(var(--primary))' : 'hsl(var(--primary-text-color))'}
                                        strokeWidth={3}
                                    />
                                    <p className={`${pathName === link.route && 'font-bold'} text-20`} >{link.label}</p>
                                </div>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={link.label}
                            href={link.route === '/profile' ? `/${loggedInUser.username}` : link.route}
                            className='w-full flex gap-4 items-center hover:bg-card-hover p-4'
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon
                                className='icon'
                                color={pathName === link.route ? 'hsl(var(--primary))' : 'hsl(var(--primary-text-color))'}
                                strokeWidth={3}
                            />
                            <p className='font-bold text-20'>{link.label}</p>
                        </Link>
                    )
                })}

                <Link
                    href={'/logout'}
                    className='w-full flex gap-4 items-center hover:bg-card-hover p-4'
                    onClick={() => setSidebarOpen(false)}
                >
                    <LogOut
                        className='icon text-primary-text'
                        strokeWidth={3}
                    />
                    <p className='font-bold text-20'>Log out</p>
                </Link>

                <div className='py-1 px-6'>
                    <div className='feed-hr-line'></div>
                </div>
            </div>
        </div>
    )
}
