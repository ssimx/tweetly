'use client';
import { PostType } from '@/lib/types';
import React, { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from './PostBtns';
import { useRouter } from 'next/navigation';
import UserHoverCard from '../UserHoverCard';

export default function ParentPostInfo({ post }: { post: PostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(post.author['_count'].followers === 1);
    const [followersCount, setFollowersCount] = useState(post.author.followers.length);
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${post.author.username}/status/${post.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    return (
        <div onClick={handleCardClick} className='parent-post'>
            <div className='parent-post-left-side min-w-[52px] min-h-full'>
                <Link href={`/${post.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                    <Image
                        src={post.author.profile.profilePicture}
                        alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                </Link>

                <div className='border-x h-full origin-top' style={{ transform: 'scaleY(1.23)' }}></div>
            </div>

            <div className='w-full flex flex-col gap-2'>
                <div className='flex gap-2 text-gray-500'>
                    <UserHoverCard
                        author={{
                            username: post.author.username,
                            name: post.author.profile.name,
                            profilePicture: post.author.profile.profilePicture,
                            bio: post.author.profile.bio,
                            following: post.author['_count'].following,
                        }}
                        followersCount={followersCount} setFollowersCount={setFollowersCount}
                        isFollowedByTheUser={isFollowedByTheUser} setIsFollowedByTheUser={setIsFollowedByTheUser} />
                    <p>@{post.author.username}</p>
                    <p>·</p>
                    <p>{formatPostDate(post.createdAt)}</p>
                </div>

                <div className='post-content'>
                    <p>{post.content}</p>
                </div>

                <div className='!border-t-0 post-btns'>
                    <PostBtns
                        postId={post.id}
                        author={post.author.username}
                        replies={post['_count'].replies}
                        reposts={post['_count'].reposts}
                        likes={post['_count'].likes}
                        reposted={!!post.reposts.length}
                        liked={!!post.likes.length}
                        bookmarked={!!post.bookmarks.length} />
                </div>
            </div>
        </div>
    )
}
