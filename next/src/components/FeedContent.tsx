'use client';

import { PostInfoType } from "@/lib/types";
import { formatPostDate } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function FeedContent() {
    const [feedPosts, setFeedPosts] = useState <PostInfoType[] | undefined | null>(undefined);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/feedPosts', {
                    method: 'GET',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.log(errorData);
                    
                    throw new Error(errorData.error);
                }

                const feedData: PostInfoType[] = await response.json();
                console.log(feedData);
                
                setFeedPosts(feedData);
            } catch (error) {

            }
        }

        fetchPosts();
    }, []);

    if (feedPosts === undefined) return <div>loading...</div>;
    if (feedPosts === null) return <div>No posts</div>;

    return (
        <section className='feed-posts-desktop gap-2'>
            {feedPosts.map((post) => {
                return (
                    <>
                        <div key={post.id} className='feed-post'>
                            <Image
                                src={`http://localhost:3001/public/profilePictures/${post.author.profile?.profilePicture}`}
                                alt='Author profile picture'
                                height={35} width={35}
                                className='rounded-full h-[35px] w-[35px]' />
                            <div className='w-full flex flex-col min-w-[1%]'>
                                <div className='flex gap-2 items-center'>
                                    <p className='font-bold'>{post.author.profile?.name}</p>
                                    <p className='text-dark-400 text-16'>@{post.author.username}</p>
                                    <p className='text-dark-400 text-16'>· {formatPostDate(post.createdAt)}</p>
                                </div>

                                <p className='break-words whitespace-normal'>{post.content}</p>
                            </div>
                        </div>
                        <div className='w-full h-1 border-b'></div>
                    </>
                )
            })}
        </section>
    )
}
