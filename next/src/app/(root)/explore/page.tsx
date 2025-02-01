import FeedPost from '@/components/feed/FeedPost';

import Link from 'next/link';
import React from 'react';
import { getExplorePosts } from '@/data-acess-layer/misc-dto';
import ExploreTrendingHashtags from '@/components/explore/ExploreTrendingHashtags';

export default async function Explore() {
    const posts = await getExplorePosts();
    const orderedPosts = posts?.sort((a, b) => (b['_count'].likes + b['_count'].replies + b['_count'].reposts) - (a['_count'].likes + a['_count'].replies + a['_count'].reposts));

    // fetch trending and random posts
    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            <div className='pt-2'>
                <ExploreTrendingHashtags />
                <div className='feed-hr-line'></div>
                <div>
                    <h1 className='pt-4 pl-4 pb-2 text-20 font-bold'>Posts For You</h1>
                    {orderedPosts
                        ? orderedPosts.map((post, index) => (
                            <div key={index}>
                                <FeedPost post={post} />
                                <div className='feed-hr-line'></div>
                            </div>
                        ))
                        : <div>No posts</div>
                    }
                    <div className='w-full flex-center p-4'>
                        <Link href={'/'} className='w-fit px-4 py-2 text-primary font-bold rounded-[15px] border border-primary/90'>More posts</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
