import { TrendingHashtagsType } from '@/context/TrendingContextProvider';
import Link from 'next/link';

export default function TrendingCard({ hashtag }: { hashtag: TrendingHashtagsType }) {

    return (
        <Link href={`http://192.168.1.155:3000/search?q=${hashtag.name}`} className='p-2 rounded flex flex-col text-14 text-secondary-text hover:bg-card-hover hover:cursor-pointer'>
            <p>Trending</p>
            <h1 className='text-18 text-primary-text font-bold'>#{hashtag.name}</h1>
            <p>{hashtag['_count'].posts} posts</p>
        </Link>
    )
}
