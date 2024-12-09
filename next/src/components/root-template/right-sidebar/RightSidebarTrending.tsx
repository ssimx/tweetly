'use client';
import { usePathname } from 'next/navigation';
import Trending from './Trending';

export default function RightSidebarTrending() {
    const pathname = usePathname();

    if (pathname.startsWith('/explore')) return <></>;

    return (
        <Trending />
    )
}
