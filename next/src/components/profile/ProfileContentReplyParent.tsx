'use client';
import React, { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from '../posts/PostBtns';
import { useRouter } from 'next/navigation';
import UserHoverCard from '../UserHoverCard';

interface Parent {
    id: number,
    content: true,
    createdAt: string,
    updatedAt: string,
    author: {
        username: string,
        profile: {
            name: string,
            profilePicture: string,
            bio: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followerId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    },
}

export default function ProfileContentReplyParent({ post }: { post: Parent }) {
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
                    <div className='flex gap-2 text-gray-500'>
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
                        <p className='whitespace-nowrap'>{formatPostDate(post.createdAt)}</p>
                    </div>
                    <div className='feed-post-content'>
                        <p className='break-all'>{post.content}</p>
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
        </div>
    )
}
