'use client';
import React, { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/UserHoverCard';
import PostDate from '../PostDate';
import PostText from '../PostText';
import PostImages from '../PostImages';
import PostBtns from '../PostBtns';
import { BasicPostType } from '@/lib/types';

export default function PostReplyParent({ post }: { post: BasicPostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author['_count'].followers);
    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);

    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${post.author.username}/status/${post.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    const openPhoto = (photoIndex: number, authorUsername: string, postId: number) => {
        router.push(`http://localhost:3000/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
    };

    return (
        <div onClick={handleCardClick} className='profile-content-post'>
            <div className='profile-content-post-content'>
                <div className='parent-post-left-side min-w-[40px] min-h-full'>
                    <Link href={`/${post.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                        <Image
                            src={post.author.profile.profilePicture}
                            alt='Post author profile pic' width={40} height={40} className='w-[40px] h-[40px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>

                    <div className='border-x h-full origin-top'></div>
                </div>

                <div className='feed-post-right-side'>
                    <div className='flex gap-2 text-secondary-text'>
                        <UserHoverCard
                            author={{
                                username: post.author.username,
                                name: post.author.profile.name,
                                profilePicture: post.author.profile.profilePicture,
                                bio: post.author.profile.bio,
                                following: post.author['_count'].following,
                            }}
                            followersCount={followersCount}
                            setFollowersCount={setFollowersCount}
                            isFollowedByTheUser={isFollowedByTheUser}
                            setIsFollowedByTheUser={setIsFollowedByTheUser}
                            isFollowingTheUser={isFollowingTheUser}
                        />
                        <p>@{post.author.username}</p>
                        <p>·</p>
                        <PostDate createdAt={post.createdAt} />
                    </div>
                    <div className='post-content flex-col'>
                        <PostText content={post.content} />
                        <PostImages
                            images={post.images}
                            authorUsername={post.author.username}
                            postId={post.id}
                            openPhoto={openPhoto} />
                    </div>
                    <div className='!border-t-0 post-btns'>
                        <PostBtns post={post} />
                    </div>
                </div>
            </div>
        </div>
    )
}
