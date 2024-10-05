'use client';

import { PostInfoType } from "@/lib/types";
import { formatPostDate } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle, Repeat2, Heart, Bookmark, Share } from 'lucide-react';
import Link from "next/link";

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
                    <div key={post.id} className='feed-post'>
                        <div className='feed-content'>
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

                                <div className="flex gap-2 items-center mt-2">
                                    <div className='w-[60%] sm:w-[50%] flex gap-1 justify-between'>
                                        <Link href={`/${post.author.username}/status/${post.id}`} className='comment-btn group'>
                                            <div className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-blue-1/10'>
                                                <MessageCircle size={20}
                                                    className='text-dark-400 group-hover:text-blue-1/70' />
                                            </div>
                                            <p>{post.replies.length}</p>
                                        </Link>
                                        <button className='repost-btn group'>
                                            <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-green-500/10'>
                                                <Repeat2 size={24} className='text-dark-400 group-hover:text-green-500/70' />
                                            </span>
                                            <p>{post.reposts.length}</p>
                                        </button>
                                        <button className='like-btn group'>
                                            <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                                                <Heart size={20} className='text-dark-400 group-hover:text-pink-500/70' />
                                            </span>
                                            <p>{post.likes.length}</p>
                                        </button>
                                    </div>
                                    <button className='bookmark-btn group'>
                                        <Bookmark size={20} className='text-dark-400 group-hover:text-blue-1/70' />
                                    </button>
                                    <button className='share-btn group'>
                                        <Share size={20} className='text-dark-400 group-hover:text-blue-1/70' />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='w-full h-1 border-b'></div>
                    </div>
                )
            })}
        </section>
    )
}
