'use client';
import Image from 'next/image';
import PostBtns from '../posts/PostBtns';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useRef, useState } from 'react';
import { NotificationPostType } from '@/app/(root)/notifications/page';
import { useRouter } from 'next/navigation';
import { Repeat2, Rss, Heart, Reply } from 'lucide-react';
import { formatPostDate } from '@/lib/utils';
import { useUserContext } from '@/context/UserContextProvider';

interface NotificationType {
    post: NotificationPostType,
    type: {
        name: string;
        description: string;
    },
    isRead: boolean,
    notifier: {
        username: string,
        profile: {
            name: string,
            profilePicture: string,
            bio: string
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    }
}

export default function NotificationPost({ post, type, isRead, notifier }: NotificationType) {
    const [postIsFollowedByTheUser, postSetIsFollowedByTheUser] = useState(post.author['_count'].followers === 1);
    const [postFollowersCount, postSetFollowersCount] = useState(post.author.followers.length);

    const [repostIsFollowedByTheUser, repostSetIsFollowedByTheUser] = useState(notifier['_count'].followers === 1);
    const [repostFollowersCount, repostSetFollowersCount] = useState(notifier.followers.length);

    // state to show whether the profile follows logged in user
    const [postIsFollowingTheUser,] = useState(post.author.following.length === 1);
    const [repostIsFollowingTheUser,] = useState(notifier.following.length === 1);
    const router = useRouter();
    const { loggedInUser } = useUserContext();
    const cardRef = useRef<HTMLDivElement>(null);

    const handleCardClick = (author: string, postId: number) => {
        router.push(`/${author}/status/${postId}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    const changeCardColor = () => {
        cardRef.current !== null && cardRef.current.classList.remove('bg-[#f3f3f3]');
    };

    return (
        <div onClick={() => handleCardClick(post.author.username, post.id)}
            className={`notifications-post ${isRead === false ? "bg-[#f3f3f3]" : ""}`}
            ref={cardRef} onMouseLeave={changeCardColor}>
            <div className='w-full flex flex-col gap-1'>
                {type.name === 'REPOST'
                    ? (
                        <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                            <UserHoverCard
                                author={{
                                    username: notifier.username,
                                    name: notifier.profile.name,
                                    profilePicture: notifier.profile.profilePicture,
                                    bio: notifier.profile.bio,
                                    following: notifier['_count'].following,
                                }}
                                followersCount={repostFollowersCount}
                                setFollowersCount={repostSetFollowersCount}
                                isFollowedByTheUser={repostIsFollowedByTheUser}
                                setIsFollowedByTheUser={repostSetIsFollowedByTheUser}
                                isFollowingTheUser={repostIsFollowingTheUser} />
                            <p className='font-semibold'>reposted {post.author.username === loggedInUser.username && 'your post'}</p>
                        </div>
                    )
                    : type.name === 'LIKE'
                        ? (
                            <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                                <UserHoverCard
                                    author={{
                                        username: notifier.username,
                                        name: notifier.profile.name,
                                        profilePicture: notifier.profile.profilePicture,
                                        bio: notifier.profile.bio,
                                        following: notifier['_count'].following,
                                    }}
                                    followersCount={repostFollowersCount}
                                    setFollowersCount={repostSetFollowersCount}
                                    isFollowedByTheUser={repostIsFollowedByTheUser}
                                    setIsFollowedByTheUser={repostSetIsFollowedByTheUser}
                                    isFollowingTheUser={repostIsFollowingTheUser} />
                                <p className='font-semibold'>liked {post.author.username === loggedInUser.username && 'your post'}</p>
                            </div>
                        )
                        : null
                }
                <div className='notifications-post-content'>
                    <div className='feed-post-left-side'>
                        <div className='flex flex-row items-center gap-2'>
                            {
                                type.name === 'REPOST'
                                    ? <Repeat2 size={20} className='text-green-500/70' />
                                    : type.name === 'LIKE'
                                        ? <Heart size={20} className='text-pink-500' />
                                        : type.name === 'REPLY'
                                            ? <Reply size={20} className='text-blue-1/70' />
                                            : <Rss size={20} className='text-blue-1/70' />
                            }
                            <Link href={`/${post.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                                <Image
                                    src={post.author.profile.profilePicture}
                                    alt='Post author profile pic'
                                    width={40} height={40}
                                    className='w-[40px] h-[40px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                            </Link>
                        </div>
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
                                followersCount={postFollowersCount}
                                setFollowersCount={postSetFollowersCount}
                                isFollowedByTheUser={postIsFollowedByTheUser}
                                setIsFollowedByTheUser={postSetIsFollowedByTheUser}
                                isFollowingTheUser={postIsFollowingTheUser} />
                            <p>@{post.author.username}</p>
                            <p>·</p>
                            <p className='whitespace-nowrap'>{formatPostDate(post.createdAt)}</p>
                        </div>
                        <div className='feed-post-content post-content'>
                            <p>{post.content}</p>
                        </div>

                        {post.replyTo && (
                            <div onClick={() => handleCardClick(post.replyTo?.author.username as string, post.replyTo?.id as number)} className='notification-replied-post'>
                                <div className="notifications-replied-post-content">
                                    <div className='feed-post-left-side'>
                                        <Link href={`/${post.replyTo.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                                            <Image
                                                src={post.author.profile.profilePicture}
                                                alt='Post author profile pic'
                                                width={24} height={24}
                                                className='w-[24px] h-[24px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                                        </Link>
                                    </div>
                                    <div className='feed-post-right-side'>
                                        <div className='flex gap-2 text-secondary-text'>
                                            <UserHoverCard
                                                author={{
                                                    username: post.replyTo.author.username,
                                                    name: post.replyTo.author.profile.name,
                                                    profilePicture: post.replyTo.author.profile.profilePicture,
                                                    bio: post.replyTo.author.profile.bio,
                                                    following: post.replyTo.author['_count'].following,
                                                }}
                                                followersCount={postFollowersCount}
                                                setFollowersCount={postSetFollowersCount}
                                                isFollowedByTheUser={postIsFollowedByTheUser}
                                                setIsFollowedByTheUser={postSetIsFollowedByTheUser}
                                                isFollowingTheUser={postIsFollowingTheUser} />
                                            <p>@{post.replyTo.author.username}</p>
                                            <p>·</p>
                                            <p>{formatPostDate(post.replyTo.createdAt)}</p>
                                        </div>
                                        <div className='feed-post-content'>
                                            <p className='break-all'>{post.replyTo.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
        </div>
    )
}
