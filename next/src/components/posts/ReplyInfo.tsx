'use client';
import { PostType } from '@/lib/types';
import Image from 'next/image';
import PostBtns from './PostBtns';
import Link from 'next/link';
import ParentPostInfo from './ParentPostInfo';
import { useEffect, useRef, useState } from 'react';
import UserHoverCard from '../UserHoverCard';

export default function ReplyInfo({ replyPost, parentPost }: { replyPost: PostType, parentPost: PostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(replyPost.author['_count'].followers === 1);
    const [followersCount, setFollowersCount] = useState(replyPost.author.followers.length);

    const replyDate = new Date(replyPost.createdAt);
    const replyTime = `${replyDate.getHours()}:${replyDate.getMinutes()}`;
    const replyFormatDate = `${replyDate.toLocaleString('default', { month: 'short' })} ${replyDate.getDate()}, ${replyDate.getFullYear()}`;
    const parentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        parentRef.current && parentRef.current.scrollIntoView();
    }, []);

    return (
        <div className='flex flex-col'>
            <ParentPostInfo post={parentPost} />

            <div className='post' ref={parentRef}>
                <div className='post-header'>
                    <Link href={`/${replyPost.author.username}`} className='group'>
                        <Image
                            src={replyPost.author.profile?.profilePicture}
                            alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <div className=''>
                        <UserHoverCard
                            author={{
                                username: replyPost.author.username,
                                name: replyPost.author.profile.name,
                                profilePicture: replyPost.author.profile.profilePicture,
                                bio: replyPost.author.profile.bio,
                                following: replyPost.author['_count'].following,
                            }}
                            followersCount={followersCount} setFollowersCount={setFollowersCount}
                            isFollowedByTheUser={isFollowedByTheUser} setIsFollowedByTheUser={setIsFollowedByTheUser} />
                        <p className='text-dark-500'>@{replyPost.author.username}</p>
                    </div>
                </div>
                <div className='post-content'>
                    <p>{replyPost.content}</p>
                </div>
                <div className='post-footer'>
                    <p>{replyTime}</p>
                    <p className='px-1'>·</p>
                    <p>{replyFormatDate}</p>
                </div>
                <div className='post-btns'>
                    <PostBtns
                        postId={replyPost.id}
                        author={replyPost.author.username}
                        replies={replyPost['_count'].replies}
                        reposts={replyPost['_count'].reposts}
                        likes={replyPost['_count'].likes}
                        reposted={!!replyPost.reposts.length}
                        liked={!!replyPost.likes.length}
                        bookmarked={!!replyPost.bookmarks.length} />
                </div>
            </div>
        </div>
    )
}
