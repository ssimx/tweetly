'use client';
import { PostInfoType } from "@/lib/types";
import { formatPostDate } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import PostBtns from "./PostBtns";

export default function FeedContent() {
    const [feedPosts, setFeedPosts] = useState<PostInfoType[] | undefined | null>(undefined);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts/feed/global', {
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
        <section className='feed-posts-desktop'>
            {feedPosts.map((post) => {
                return (
                    <div key={post.id}>
                        <Link
                            href={`/${post.author.username}/status/${post.id}`}
                            className='feed-post'>
                            <div className='feed-content'>
                                <Link href={`/${post.author.username}`} className='h-fit w-fit group'>
                                    <Image
                                        src={`http://localhost:3001/public/profilePictures/${post.author.profile?.profilePicture}`}
                                        alt='Author profile picture'
                                        height={35} width={35}
                                        className='rounded-full h-[35px] w-[35px] group-hover:outline group-hover:outline-primary/10' />
                                </Link>
                                <div className='w-full flex flex-col min-w-[1%]'>
                                    <div className='flex gap-2 items-center'>
                                        <Link href={`/${post.author.username}`} className='h-fit w-fit hover:underline'>
                                            <p className='font-bold'>{post.author.profile?.name}</p>
                                        </Link>
                                        <p className='text-dark-400 text-16'>@{post.author.username}</p>
                                        <p className='text-dark-400 text-16'>· {formatPostDate(post.createdAt)}</p>
                                    </div>
                                    <p className='break-words whitespace-normal mb-2'>{post.content}</p>
                                    <PostBtns post={post} />
                                </div>
                            </div>
                        </Link>
                        <div className="feed-hr-line"></div>
                    </div>
                )
            })}
        </section>
    )
}
