import { formatPostDate } from '@/lib/utils';
import React from 'react';

export default function PostDate({ createdAt }: { createdAt: Date }) {

    return (
        <p className='whitespace-nowrap' suppressHydrationWarning>{formatPostDate(createdAt)}</p>
    )
}
