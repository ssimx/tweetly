'use client';
import Search from '@/components/Search';
import { usePathname } from 'next/navigation';

export default function RightSidebarSearch() {
    const pathname = usePathname();

    if (pathname.startsWith('/search')) return <></>;

    return (
        <Search />
    )
}
