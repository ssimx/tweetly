import FeedPost from '@/components/feed/FeedPost';
import TrendingCard from '@/components/root-template/right-sidebar/TrendingCard';
import { decryptSession, getToken } from '@/lib/session';
import { PostType } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import DialogTrendingCard from '@/components/root-template/right-sidebar/DialogTrendingCard';
import { TrendingHashtagsType } from '@/context/TrendingContextProvider';

export default async function Explore() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const topPostsPromise = fetch(`http://localhost:3000/api/posts/explore/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    const trendingHashtagsPromise = fetch('http://localhost:3000/api/posts/trending', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });

    const [topPostsResponse, trendingHashtagsResponse] = await Promise.all([topPostsPromise, trendingHashtagsPromise]);

    const topPosts = await topPostsResponse.json().then((res) => res.posts) as PostType[];
    const trendingHashtags = await trendingHashtagsResponse.json().then((res) => res.hashtags) as TrendingHashtagsType[];

    const orderedPosts = topPosts.sort((a, b) => (b['_count'].likes + b['_count'].replies + b['_count'].reposts) - (a['_count'].likes + a['_count'].replies + a['_count'].reposts));

    // fetch trending and random posts
    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            <div className='pt-2'>
                {trendingHashtags.length !== 0 && (
                    <div className='px-4 pb-4'>
                        <h1 className='text-24 font-bold mb-2'>Trending</h1>
                        <div className='flex flex-col flex-grow'>
                            {
                                trendingHashtags === undefined
                                    ? 'loading'
                                    : trendingHashtags.slice(0, 8).length === 0
                                        ? 'There is currently no trending hashtags'
                                        : trendingHashtags.slice(0, 8).map((hashtag, index) => (
                                            <TrendingCard key={index} hashtag={hashtag} />
                                        ))
                            }
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className='w-full text-primary text-start hover:font-semibold disabled:hidden' disabled={trendingHashtags === undefined}>Show more</button>
                            </DialogTrigger>
                            {
                                trendingHashtags !== undefined && trendingHashtags.length !== 0 && (
                                    <DialogContent className="max-w-[500px] max-h-[90vh] overflow-hidden">
                                        <DialogHeader className='mb-3'>
                                            <DialogTitle className='text-20 font-bold'>Currently trending</DialogTitle>
                                        </DialogHeader>
                                        <div className='flex-grow overflow-y-auto max-h-[calc(90vh-100px)]'>
                                            {
                                                trendingHashtags === undefined
                                                    ? 'loading'
                                                    : trendingHashtags.map((hashtag, index) => (
                                                        <DialogTrendingCard key={index} hashtag={hashtag} />
                                                    ))
                                            }
                                        </div>
                                    </DialogContent>
                                )
                            }
                        </Dialog>
                    </div>
                )
                }
                <div className='feed-hr-line'></div>
                <div>
                    <h1 className='pt-4 pl-4 pb-2 text-20 font-bold'>Posts For You</h1>
                    {orderedPosts.map((post, index) => (
                        <div key={index}>
                            <FeedPost post={post} />
                            <div className='feed-hr-line'></div>
                        </div>
                    ))
                    }
                    <div className='w-full flex-center p-4'>
                        <Link href={'/'} className='w-fit px-4 py-2 text-primary font-bold rounded-[15px] border border-primary/90'>More posts</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
