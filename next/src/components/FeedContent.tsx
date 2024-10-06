'use client';

import { PostInfoType } from "@/lib/types";
import { formatPostDate } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle, Repeat2, Heart, Bookmark, Share } from 'lucide-react';
import Link from "next/link";
import { useUserContext } from "@/context/UserContextProvider";

export default function FeedContent() {
    const [feedPosts, setFeedPosts] = useState<PostInfoType[] | undefined | null>(undefined);
    const { user } = useUserContext();

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

    const handlePostBtnsInteraction = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, postId: number) => {
        const btn = e.currentTarget;
        const type = btn.dataset.type as string;
        const styleType = type === 'like' ? 'lik' : type;
        const status = btn.dataset.status;

        btn.disabled = true;
        // optimistically change the styling
        btn.classList.toggle(`${styleType}ed`);
        if (status === 'true') {
            try {
                const response = await fetch(`/api/posts/remove${type.charAt(0).toUpperCase() + type.slice(1)}/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to remove the ${type} on the post`);
                }

                btn.dataset.status = 'false';
            } catch (error) {
                console.log(error);
                // revert the styling
                btn.classList.toggle(`${styleType}ed`);
            }
        } else {
            try {
                const response = await fetch(`/api/posts/${type}/${postId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to ${type} the post`);
                }

                btn.dataset.status = 'true';
            } catch (error) {
                console.log(error);
                // revert the styling
                btn.classList.toggle(`${styleType}ed`);
            }
        }
        btn.disabled = false;
    };

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

                                        <button
                                            className={`repost-btn group ${post.reposts.some((repost) => repost.userId === user.id) ? 'reposted' : ''}`}
                                            data-type='repost'
                                            data-status={`${post.reposts.some((repost) => repost.userId === user.id)}`}
                                            onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                                            <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-green-500/10'>
                                                <Repeat2 size={24} className='text-dark-400 group-hover:text-green-500/70' />
                                            </span>
                                            <p>{post.reposts.length}</p>
                                        </button>

                                        <button
                                            className={`like-btn group ${post.likes.some((like) => like.userId === user.id) ? 'liked' : ''}`}
                                            data-type='like'
                                            data-status={`${post.likes.some((like) => like.userId === user.id)}`}
                                            onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                                            <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                                                <Heart size={20} className='text-dark-400 group-hover:text-pink-500' />
                                            </span>
                                            <p>{post.likes.length}</p>
                                        </button>
                                    </div>
                                    <button
                                        className={`bookmark-btn group ${post.bookmarks.some((bookmark) => bookmark.userId === user.id ? 'bookmarked' : '')}`}
                                        data-type='bookmark'
                                        data-status={`${post.bookmarks.some((bookmark) => bookmark.userId === user.id)}`}
                                        onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                                        <Bookmark size={20} className='text-dark-400 text-blue-1/70' />
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
