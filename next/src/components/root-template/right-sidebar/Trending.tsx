
import Link from 'next/link'
import React from 'react'

export default function Trending() {
    return (
        <div className='w-full h-[500px] rounded-[15px] border p-3 flex flex-col gap-2'>
            <h1 className='font-bold text-20'>What&apos;s happening</h1>
            <div className='flex-grow'>
                <div>Test</div>
            </div>
            <Link href={'/'} className='text-primary hover:font-semibold'>Show more</Link>
        </div>
    )
}
