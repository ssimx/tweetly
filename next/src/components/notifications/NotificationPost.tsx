'use client';
import Image from 'next/image';
import PostBtns from '../posts/PostBtns';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Repeat2, Rss, Heart, Reply } from 'lucide-react';
import { useUserContext } from '@/context/UserContextProvider';
import PostDate from '../posts/PostDate';
import { NotificationPostType, ReplyPostType } from '@/lib/types';

export default function NotificationPost({ notification }: { notification: NotificationPostType }) {
    const [postIsFollowedByTheUser, postSetIsFollowedByTheUser] = useState(notification.post.author['_count'].followers === 1);
    const [postFollowersCount, postSetFollowersCount] = useState(notification.post.author.followers.length);

    const [repostIsFollowedByTheUser, repostSetIsFollowedByTheUser] = useState(notification.notifier['_count'].followers === 1);
    const [repostFollowersCount, repostSetFollowersCount] = useState(notification.notifier.followers.length);

    // state to show whether the profile follows logged in user
    const [postIsFollowingTheUser,] = useState(notification.post.author.following.length === 1);
    const [repostIsFollowingTheUser,] = useState(notification.notifier.following.length === 1);
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
        <div onClick={() => handleCardClick(notification.post.author.username, notification.post.id)}
            className={`notifications-post ${notification.isRead === false ? "bg-[#f3f3f3]" : ""}`}
            ref={cardRef} onMouseLeave={changeCardColor}>
            <div className='w-full flex flex-col gap-1'>
                {notification.type.name === 'REPOST'
                    ? (
                        <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                            <UserHoverCard
                                author={{
                                    username: notification.notifier.username,
                                    name: notification.notifier.profile.name,
                                    profilePicture: notification.notifier.profile.profilePicture,
                                    bio: notification.notifier.profile.bio,
                                    following: notification.notifier['_count'].following,
                                }}
                                followersCount={repostFollowersCount}
                                setFollowersCount={repostSetFollowersCount}
                                isFollowedByTheUser={repostIsFollowedByTheUser}
                                setIsFollowedByTheUser={repostSetIsFollowedByTheUser}
                                isFollowingTheUser={repostIsFollowingTheUser} />
                            <p className='font-semibold'>reposted {notification.post.author.username === loggedInUser.username && 'your post'}</p>
                        </div>
                    )
                    : notification.type.name === 'LIKE'
                        ? (
                            <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                                <UserHoverCard
                                    author={{
                                        username: notification.notifier.username,
                                        name: notification.notifier.profile.name,
                                        profilePicture: notification.notifier.profile.profilePicture,
                                        bio: notification.notifier.profile.bio,
                                        following: notification.notifier['_count'].following,
                                    }}
                                    followersCount={repostFollowersCount}
                                    setFollowersCount={repostSetFollowersCount}
                                    isFollowedByTheUser={repostIsFollowedByTheUser}
                                    setIsFollowedByTheUser={repostSetIsFollowedByTheUser}
                                    isFollowingTheUser={repostIsFollowingTheUser} />
                                <p className='font-semibold'>liked {notification.post.author.username === loggedInUser.username && 'your post'}</p>
                            </div>
                        )
                        : null
                }
                <div className='notifications-post-content'>
                    <div className='feed-post-left-side'>
                        <div className='flex flex-row items-center gap-2'>
                            {
                                notification.type.name === 'REPOST'
                                    ? <Repeat2 size={20} className='text-green-500/70' />
                                    : notification.type.name === 'LIKE'
                                        ? <Heart size={20} className='text-pink-500' />
                                        : notification.type.name === 'REPLY'
                                            ? <Reply size={20} className='text-blue-1/70' />
                                            : <Rss size={20} className='text-blue-1/70' />
                            }
                            <Link href={`/${notification.post.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                                <Image
                                    src={notification.post.author.profile.profilePicture}
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
                                    username: notification.post.author.username,
                                    name: notification.post.author.profile.name,
                                    profilePicture: notification.post.author.profile.profilePicture,
                                    bio: notification.post.author.profile.bio,
                                    following: notification.post.author['_count'].following,
                                }}
                                followersCount={postFollowersCount}
                                setFollowersCount={postSetFollowersCount}
                                isFollowedByTheUser={postIsFollowedByTheUser}
                                setIsFollowedByTheUser={postSetIsFollowedByTheUser}
                                isFollowingTheUser={postIsFollowingTheUser} />
                            <p>@{notification.post.author.username}</p>
                            <p>·</p>
                            <PostDate createdAt={notification.post.createdAt} />
                        </div>
                        <div className='feed-post-content post-content'>
                            <p>{notification.post.content}</p>
                        </div>

                        {('replyTo' in notification.post && notification.post.replyTo) && (() => {
                            const post = notification.post as ReplyPostType;

                            return (
                                <div
                                    onClick={() => handleCardClick(post.replyTo.author.username, post.replyTo.id)}
                                    className='notification-replied-post'
                                >
                                    <div className="notifications-replied-post-content">
                                        <div className='feed-post-left-side'>
                                            <Link
                                                href={`/${post.replyTo.author.username}`}
                                                className='flex group'
                                                onClick={(e) => handleLinkClick(e)}
                                            >
                                                <Image
                                                    src={post.replyTo.author.profile.profilePicture} // Now accessible
                                                    alt='Post author profile pic'
                                                    width={24} height={24}
                                                    className='w-[24px] h-[24px] rounded-full group-hover:outline group-hover:outline-primary/10'
                                                />
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
                                                    isFollowingTheUser={postIsFollowingTheUser}
                                                />
                                                <p>@{post.replyTo.author.username}</p>
                                                <p>·</p>
                                                <PostDate createdAt={post.replyTo.createdAt} />
                                            </div>
                                            <div className='feed-post-content'>
                                                <p className='break-all'>{post.replyTo.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className='!border-t-0 post-btns'>
                            <PostBtns post={notification.post} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
