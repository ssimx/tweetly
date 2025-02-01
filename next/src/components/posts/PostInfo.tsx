'use client';
import { PostType } from '@/lib/types';
import Image from 'next/image';
import PostBtns from './PostBtns';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useState } from 'react';
import PostText from './PostText';
import PostImages from './PostImages';


export default function PostInfo({ post }: { post: PostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author.followers.length);

    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);

    const postDate = new Date(post.createdAt);
    const postTime = `${postDate.getHours()}:${postDate.getMinutes()}`;
    const postFormatDate = `${postDate.toLocaleString('default', { month: 'short' })} ${postDate.getDate()}, ${postDate.getFullYear()}`;

    return (
        <>
            <div className='post'>
                <div className='post-header'>
                    <Link href={`/${post.author.username}`} className='group'>
                        <Image
                            src={post.author.profile.profilePicture}
                            alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <div className=''>
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
                    </div>
                </div>
                <div className='post-content flex-col'>
                    <PostText content={post.content} />
                    <PostImages images={post.images} />
                </div>
                <div className='post-footer'>
                    <p>{postTime}</p>
                    <p className='px-1'>·</p>
                    <p>{postFormatDate}</p>
                </div>
                <div className='post-btns'>
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
        </>
    )
}
