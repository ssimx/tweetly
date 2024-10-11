'use client';
import { Reply } from './ProfileContent';
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
import { useRouter } from 'next/navigation';
import ProfileContentReplyParent from './ProfileContentReplyParent';

export default function ProfileContentPost({ replyPost }: { replyPost: Reply }) {
    const [isFollowing, setIsFollowing] = useState(replyPost.author.followers.length === 1);
    const [followers, setFollowers] = useState(replyPost.author['_count'].followers);
    const router = useRouter();

    const parentPost = JSON.parse(JSON.stringify(replyPost.replyTo))

    const handleCardClick = () => {
        router.push(`/${replyPost.author.username}/status/${replyPost.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
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
                        <div className='flex gap-2 text-gray-500'>
                            <HoverCard>
                                <HoverCardTrigger href={`/${replyPost.author.username}`} className='text-black-1 font-bold hover:underline' onClick={(e) => handleLinkClick(e)}>{replyPost.author.profile.name}</HoverCardTrigger>
                                <HoverCardContent>
                                    <UserHoverCard
                                        author={{
                                            username: replyPost.author.username,
                                            name: replyPost.author.profile.name,
                                            profilePicture: replyPost.author.profile.profilePicture,
                                            bio: replyPost.author.profile.bio,
                                            following: replyPost.author['_count'].following,
                                        }}
                                        followers={followers} setFollowers={setFollowers}
                                        isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
                                </HoverCardContent>
                            </HoverCard>
                            <p>@{replyPost.author.username}</p>
                            <p>·</p>
                            <p>{formatPostDate(replyPost.createdAt)}</p>
                        </div>
                        <div className='feed-post-content'>
                            <p className='break-all'>{replyPost.content}</p>
                        </div>
                        <div className='!border-t-0 post-btns'>
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
            </div>
        </div>
    )
}
