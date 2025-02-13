import { formatPostDate } from '@/lib/utils';
import React from 'react';

export default function PostDate({ createdAt }: { createdAt: string }) {

    return (
        <p className='whitespace-nowrap' suppressHydrationWarning>{formatPostDate(createdAt)}</p>
    )
}
