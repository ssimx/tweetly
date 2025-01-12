'use client';
import { usePathname } from 'next/navigation';
import Trending from './Trending';

export default function RightSidebarTrendingHashtags() {
    const pathname = usePathname();
    if (pathname.startsWith('/explore')) return <></>;

    return (
        <Trending />
    )
}
