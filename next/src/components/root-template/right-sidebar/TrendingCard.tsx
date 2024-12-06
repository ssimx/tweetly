import { TrendingHashtagType } from './Trending';
import Link from 'next/link';

export default function TrendingCard({ hashtag }: { hashtag: TrendingHashtagType }) {

    return (
        <Link href={`http://localhost:3000/hashtag/${hashtag.name}`} className='p-2 rounded flex flex-col text-14 text-gray-500 hover:bg-card-hover hover:cursor-pointer'>
            <p>Trending</p>
            <h1 className='text-18 text-black-1 font-bold'>#{hashtag.name}</h1>
            <p>{hashtag['_count'].posts} posts</p>
        </Link>
    )
}
