'use client';
import { PostRepost } from './ProfileContent';
import Link from 'next/link';
import Image from 'next/image';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import UserHoverCard from '../UserHoverCard';
import { formatPostDate } from '@/lib/utils';
import PostBtns from '../posts/PostBtns';
import { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContextProvider';

export default function ProfileContentPost({ post }: { post: PostRepost }) {
    const [isFollowing, setIsFollowing] = useState(post.author.followers.length === 1);
    const [followers, setFollowers] = useState(post.author['_count'].followers);
    const [postIsVisible, setPostIsVisible] = useState(true);
    const router = useRouter();
    const { user } = useUserContext();
    const path = usePathname();

    const handleCardClick = () => {
        router.push(`/${post.author.username}/status/${post.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    if (!postIsVisible) return <div className='mt-[-1px]'></div>;

    return (
        <div onClick={handleCardClick} className='profile-content-post'>
            {post.repost && (
                <div className='flex items-center gap-1 text-14 font-bold text-dark-400'>
                    <Repeat2 size={16} className='text-dark-400' />
                    { path === `/${user.username}`
                        ? <p>You reposted</p>
                        : <p>Reposted</p>
                    }
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
                            bookmarked={!!post.bookmarks.length}
                            setPostIsVisible={setPostIsVisible} />
                    </div>
                </div>
            </div>
        </div>
    )
}
