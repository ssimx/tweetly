'use client';
import { bottomNavLinks } from '@/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

export default function PhoneBottomNav() {
    const pathname = usePathname();

    return (
        <nav className='w-full bg-black-1 xs:hidden'>
            <div className='h-full flex gap-8 justify-evenly items-center'>
                {bottomNavLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                        <Link key={index} href={link.route}>
                            <Icon size={24} color={pathname === link.route ? 'hsl(var(--primary))' : '#F4F3F2'} />
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}