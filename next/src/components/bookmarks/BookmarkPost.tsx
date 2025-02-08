'use client';
import Image from 'next/image';
import PostBtns from '../posts/PostBtns';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reply } from 'lucide-react';
import PostDate from '../posts/PostDate';
import { BookmarkPostType } from '@/lib/types';

export default function BookmarkPost({ post }: { post: BookmarkPostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author['_count'].followers);
    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);

    const [replyIsFollowedByTheUser, setReplyIsFollowedByTheUser] = useState(post.replyTo?.author.followers.length === 1);
    const [replyFollowersCount, setReplyFollowersCount] = useState(post.replyTo?.author['_count'].followers);
    // state to show whether the profile follows logged in user
    const [replyIsFollowingTheUser,] = useState(post.replyTo?.author.following.length === 1);

    const [postIsVisible, setPostIsVisible] = useState(true);

    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${post.author.username}/status/${post.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    if (!postIsVisible) return <div className='mt-[-1px]'></div>;

    return (
        <>
            <div onClick={handleCardClick} className='profile-content-post'>
                {post.replyTo && (
                    <div className='flex items-center gap-1 text-14 text-secondary-text'>
                        <Reply size={16} className='text-secondary-text' />
                        <div className='flex gap-x-1'>
                            <p className='flex items-center gap-1'>Reply to</p>
                            <UserHoverCard
                                author={{
                                    username: post.replyTo.author.username,
                                    name: post.replyTo.author.profile.name,
                                    profilePicture: post.replyTo.author.profile.profilePicture,
                                    bio: post.replyTo.author.profile.bio,
                                    following: post.replyTo.author['_count'].following,
                                }}
                                followersCount={replyFollowersCount as number}
                                setFollowersCount={setReplyFollowersCount as React.Dispatch<React.SetStateAction<number>>}
                                isFollowedByTheUser={replyIsFollowedByTheUser}
                                setIsFollowedByTheUser={setReplyIsFollowedByTheUser}
                                isFollowingTheUser={replyIsFollowingTheUser} />
                        </div>
                    </div>
                )}
                <div className='profile-content-post-content'>
                    <div className='feed-post-left-side'>
                        <Link href={`/${post.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                            <Image
                                src={post.author.profile.profilePicture}
                                alt='Post author profile pic'
                                width={40} height={40}
                                className='w-[40px] h-[40px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                        </Link>
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
                                isFollowingTheUser={isFollowingTheUser} />
                            <p>@{post.author.username}</p>
                            <p>·</p>
                            <PostDate createdAt={post.createdAt} />
                        </div>
                        <div className='feed-post-content post-content'>
                            <p>{post.content}</p>
                        </div>
                        <div className='!border-t-0 post-btns'>
                            <PostBtns post={post} setPostIsVisible={setPostIsVisible} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='feed-hr-line'></div>
        </>
    )
}
