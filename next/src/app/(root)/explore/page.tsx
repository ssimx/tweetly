import React from 'react';
import ExploreContent from '@/components/explore/ExploreContent';
import { getExplorePosts } from '@/actions/get-actions';

export default async function Explore() {
    const { posts } = await getExplorePosts();
    const orderedPosts = posts?.sort((a, b) => (b['_count'].likes + b['_count'].replies + b['_count'].reposts) - (a['_count'].likes + a['_count'].replies + a['_count'].reposts)) ?? null;

    // fetch trending and random posts
    return (
        <section className='feed-desktop'>
            <ExploreContent posts={orderedPosts} />
        </section>
    )
}
