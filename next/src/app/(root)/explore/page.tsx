import React from 'react';
import ExploreContent from '@/components/explore/ExploreContent';
import { getExplorePosts } from '@/actions/get-actions';

export default async function Explore() {
    const response = await getExplorePosts();

    if (!response.success || response.data?.posts === undefined) {
        return (
            <section className='feed-desktop'>
                <ExploreContent posts={null} />
            </section>
        )
    }


    // fetch trending and random posts
    return (
        <section className='feed-desktop'>
            <ExploreContent posts={response.data.posts} />
        </section>
    )
}
