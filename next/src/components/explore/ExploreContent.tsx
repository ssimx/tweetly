'use client';
import PostCard from '../posts/PostCard';
import ExploreTrendingHashtags from './ExploreTrendingHashtags';
import Link from 'next/link';
import { BasePostDataType } from 'tweetly-shared';

export default function ExploreContent({ posts }: { posts: BasePostDataType[] | null }) {

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            <div className='pt-2'>
                <ExploreTrendingHashtags />
                <div className='feed-hr-line'></div>
                <div>
                    <h1 className='pt-4 pl-4 pb-2 text-20 font-bold'>Posts For You</h1>
                    {posts
                        ? posts.map((post) => (
                            <div key={post.id}>
                                <PostCard post={post} />
                                <div className='feed-hr-line'></div>
                            </div>
                        ))
                        : posts === null
                            ? <div>Something went wrong</div>
                            : <div>There&lsquo;s no posts</div>
                    }
                    <div className='w-full flex-center p-4'>
                        <Link href={'/'} className='w-fit px-4 py-2 text-primary font-bold rounded-[15px] border border-primary/90'>Explore more posts</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
