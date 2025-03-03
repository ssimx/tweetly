import { TrendingHashtagType } from '@/lib/types';
import Link from 'next/link';

export default function DialogTrendingCard({ hashtag }: { hashtag: TrendingHashtagType }) {

    return (
        <Link href={`http://localhost:3000/search?q=${hashtag.name}`} className='px-4 py-6 rounded flex items-center gap-8 text-14 text-secondary-text hover:bg-post-hover hover:cursor-pointer'>
            <p className='flex flex-col'>
                <span className='text-18 text-primary-text font-bold'>#{hashtag.name}</span>
            </p>
            <p className='ml-auto'>{hashtag['_count'].posts} posts</p>
        </Link>
    )
}
