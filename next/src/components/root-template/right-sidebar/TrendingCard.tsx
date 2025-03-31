import Link from 'next/link';
import { TrendingHashtagType } from 'tweetly-shared';

export default function TrendingCard({ hashtag }: { hashtag: TrendingHashtagType }) {

    return (
        <Link href={`http://192.168.1.155:3000/search?q=${hashtag.name}`} className='p-2 rounded flex flex-col text-14 text-secondary-text hover:bg-card-hover hover:cursor-pointer'>
            <p>Trending</p>
            <h1 className='text-18 text-primary-text font-bold'>#{hashtag.name}</h1>
            <p>{hashtag.postsCount} posts</p>
        </Link>
    )
}
