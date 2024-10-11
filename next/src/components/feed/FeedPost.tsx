'use client';
import { PostType } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from '../posts/PostBtns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import UserHoverCard from '../UserHoverCard';

export default function FeedPost({ post }: { post: PostType }) {
    const [isFollowing, setIsFollowing] = useState(post.author['_count'].followers === 1);
    const [followers, setFollowers] = useState(post.author.followers.length);
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${post.author.username}/status/${post.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    return (
        <div onClick={handleCardClick} className='feed-post'>
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
                <div className='flex gap-2 text-gray-500'>
                    <HoverCard>
                        <HoverCardTrigger href={`/${post.author.username}`} className='text-black-1 font-bold hover:underline' onClick={(e) => handleLinkClick(e)}>{post.author.profile.name}</HoverCardTrigger>
                        <HoverCardContent>
                            <UserHoverCard
                                author={{
                                    username: post.author.username,
                                    name: post.author.profile.name,
                                    profilePicture: post.author.profile.profilePicture,
                                    bio: post.author.profile.bio,
                                    following: post.author['_count'].following,
                                }}
                                followers={followers} setFollowers={setFollowers}
                                isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
                        </HoverCardContent>
                    </HoverCard>
                    <p>@{post.author.username}</p>
                    <p>·</p>
                    <p>{formatPostDate(post.createdAt)}</p>
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
    )
}
