'use client';
import { PostType } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from '../PostBtns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserHoverCard from '../../UserHoverCard';

export default function ReplyPost({ post }: { post: PostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(post.author['_count'].followers === 1);
    const [followersCount, setFollowersCount] = useState(post.author.followers.length);

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
        <div onClick={() => handleCardClick()} className='post hover:bg-card-hover hover:cursor-pointer'>
            <div className='post-header'>
                <Link href={`/${post.author.username}`} className='group' onClick={(e) => handleLinkClick(e)}>
                    <Image
                        src={post.author.profile?.profilePicture}
                        alt='Post author profile pic' width={35} height={35} className='w-[35px] h-[35px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                </Link>
                <div className='flex gap-2 min-w-0 text-dark-500'>
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
                    <p className='whitespace-nowrap'>{formatPostDate(post.createdAt)}</p>
                </div>
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
    )
}
