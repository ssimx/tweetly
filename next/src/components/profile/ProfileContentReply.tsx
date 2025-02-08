'use client';
import Link from 'next/link';
import Image from 'next/image';
import UserHoverCard from '../UserHoverCard';
import { formatPostDate } from '@/lib/utils';
import PostBtns from '../posts/PostBtns';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileContentReplyParent from './ProfileContentReplyParent';
import PostText from '../posts/PostText';
import PostImages from '../posts/PostImages';
import { BasicPostType, ProfileReplyPostType } from '@/lib/types';

export default function ProfileContentReply({ replyPost }: { replyPost: ProfileReplyPostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(replyPost.author['_count'].followers === 1);
    const [followersCount, setFollowersCount] = useState(replyPost.author.followers.length);
    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(replyPost.author.following.length === 1);
    const router = useRouter();

    const parentPost = JSON.parse(JSON.stringify(replyPost.replyTo)) as BasicPostType;

    const handleCardClick = () => {
        router.push(`/${replyPost.author.username}/status/${replyPost.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    const openPhoto = (photoIndex: number) => {
        router.push(`http://localhost:3000/${replyPost.author.username}/status/${replyPost.id}/photo/${photoIndex + 1}`, { scroll: false });
    };

    return (
        <div className='flex flex-col'>
            <ProfileContentReplyParent post={parentPost} />

            <div onClick={handleCardClick} className='profile-content-post'>
                <div className='profile-content-post-content'>
                    <div className='feed-post-left-side'>
                        <Link href={`/${replyPost.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                            <Image
                                src={replyPost.author.profile.profilePicture}
                                alt='Post author profile pic'
                                width={40} height={40}
                                className='w-[40px] h-[40px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                        </Link>
                    </div>
                    <div className='feed-post-right-side'>
                        <div className='flex gap-2 text-secondary-text'>
                            <UserHoverCard
                                author={{
                                    username: replyPost.author.username,
                                    name: replyPost.author.profile.name,
                                    profilePicture: replyPost.author.profile.profilePicture,
                                    bio: replyPost.author.profile.bio,
                                    following: replyPost.author['_count'].following,
                                }}
                                followersCount={followersCount}
                                setFollowersCount={setFollowersCount}
                                isFollowedByTheUser={isFollowedByTheUser}
                                setIsFollowedByTheUser={setIsFollowedByTheUser}
                                isFollowingTheUser={isFollowingTheUser} />
                            <p>@{replyPost.author.username}</p>
                            <p>·</p>
                            <p className='whitespace-nowrap'>{formatPostDate(replyPost.createdAt)}</p>
                        </div>
                        <div className='post-content flex-col'>
                            <PostText content={replyPost.content} />
                            <PostImages images={replyPost.images} openPhoto={openPhoto} />
                        </div>
                        <div className='!border-t-0 post-btns'>
                            <PostBtns post={replyPost} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
