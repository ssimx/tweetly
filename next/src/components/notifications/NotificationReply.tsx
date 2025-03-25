'use client';
import UserHoverCard from '../misc/UserHoverCard';
import { useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContextProvider';
import PostMenuButton from '../posts/post-parts/PostMenuButton';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import BasicPostTemplate from '../posts/templates/BasicPostTemplate';
import { Reply } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PostDate from '../posts/post-parts/PostDate';
import PostText from '../posts/post-parts/PostText';
import PostImages from '../posts/post-parts/PostImages';
import { BasePostDataType } from 'tweetly-shared';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';

export default function NotificationReply({ post, isRead }: { post: BasePostDataType, isRead: boolean }) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    const cardRef = useRef<HTMLDivElement>(null);

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // PARENT POST
    const parentInitialState: UserStateType = {
        relationship: {
            isFollowingViewer: post.replyTo!.author.relationship.isFollowingViewer,
            hasBlockedViewer: post.replyTo!.author.relationship.hasBlockedViewer,
            isFollowedByViewer: post.replyTo!.author.relationship.isFollowedByViewer,
            isBlockedByViewer: post.replyTo!.author.relationship.isBlockedByViewer,
            notificationsEnabled: post.replyTo!.author.relationship.notificationsEnabled,
        },
        stats: {
            followersCount: post.replyTo!.author.stats.followersCount,
            followingCount: post.replyTo!.author.stats.followingCount,
            postsCount: post.replyTo!.author.stats.postsCount,
        }
    };
    const [parentUserState, parentDispatch] = useReducer(userInfoReducer, parentInitialState);

    // REPLY POST
    const replyInitialState: UserStateType = {
        relationship: {
            isFollowingViewer: post.author.relationship.isFollowingViewer,
            hasBlockedViewer: post.author.relationship.hasBlockedViewer,
            isFollowedByViewer: post.author.relationship.isFollowedByViewer,
            isBlockedByViewer: post.author.relationship.isBlockedByViewer,
            notificationsEnabled: post.author.relationship.notificationsEnabled,
        },
        stats: {
            followersCount: post.author.stats.followersCount,
            followingCount: post.author.stats.followingCount,
            postsCount: post.author.stats.postsCount,
        }
    };
    const [replyUserState, replyDispatch] = useReducer(userInfoReducer, replyInitialState);

    useEffect(() => {
        const suggestedUsers = userFollowSuggestions?.filter((suggestedUser) => suggestedUser.username === post.replyTo?.author.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === post.replyTo?.author.username) {
                    parentDispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
                } else if (user.username === post.author.username) {
                    replyDispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' })
                }
            });
        }
    }, [userFollowSuggestions, post]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, authorUsername: string, postId: number) => {
        const targetElement = e.target as HTMLElement;

        // skip any clicks that are not coming from the card element
        if (targetElement.closest('button') || targetElement.closest('img') || targetElement.closest('a')) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        // Otherwise, navigate to the post in new tab
        if (e.button === 1) {
            // Check if it's a middle mouse button click
            e.preventDefault(); // Prevent default middle-click behavior
            const newWindow = window.open(`/${authorUsername}/status/${postId}`, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        } else if (e.button === 0) {
            // Check if it's a left mouse button click
            router.push(`/${authorUsername}/status/${postId}`);
        }
    };

    const openPhoto = (photoIndex: number, authorUsername: string, postId: number) => {
        router.push(`http://192.168.1.155:3000/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
    };

    const changeCardColor = () => {
        cardRef.current !== null && cardRef.current.classList.remove('bg-secondary-foreground');
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    if (blockedUsers.some((user) => user === post.author.username)) {
        return (
            <div className="w-full px-4 py-2 flex">
                <p className="text-secondary-text">You&apos;ve blocked this user. <span>Unblock to see their posts.</span></p>
                <PostMenuButton
                    post={post}
                    userState={replyUserState}
                    dispatch={replyDispatch}
                />
            </div>
        )
    }

    return (
        <div
            ref={cardRef}
            className={`w-full flex flex-col gap-3 px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer ${isRead === false ? "bg-secondary-foreground" : ""}`}
            role="link"
            tabIndex={0}
            aria-label={`View post by ${post.author.username}`}
            onMouseDown={(e) => handleCardClick(e, post.author.username, post.id)}
            onMouseLeave={changeCardColor}
        >
            <div className='flex gap-1 text-14 font-bold text-secondary-text'>
                <Reply size={20} className='text-blue-1/70 mr-1' />

                <UserHoverCard
                    user={post.author}
                    userState={replyUserState}
                    dispatch={replyDispatch}
                />

                <p className='font-semibold'>replied {post.author.username === loggedInUser.username && 'to your post'}</p>
            </div>

            <BasicPostTemplate
                post={post}
                userState={replyUserState}
                dispatch={replyDispatch}
                openPhoto={openPhoto}
            >

                <div
                    className='mt-2 w-full border rounded-xl p-2 flex flex-row items-center gap-2 hover:bg-secondary-foreground cursor-pointer'
                    onClick={(e) => handleCardClick(e, post.replyTo!.author.username, post.replyTo!.id)}
                >
                    <div className='w-full grid grid-cols-post-layout grid-rows-1 gap-2'>
                        <div className='w-auto h-full'>
                            <Link
                                className='flex group' onClick={(e) => e.stopPropagation()}
                                href={`/${post.replyTo!.author.username}`}
                            >
                                <Image
                                    className='w-[24px] h-[24px] rounded-full group-hover:outline group-hover:outline-primary/10'
                                    src={post.replyTo!.author.profile.profilePicture}
                                    alt='Post author profile pic'
                                    width={24} height={24}
                                />
                            </Link>
                        </div>
                        <div className='w-full flex flex-col min-w-0'>
                            <div className='w-full min-w-[0px] grid grid-cols-[auto_auto_auto_auto_1fr] grid-rows-1 gap-1 text-secondary-text'>
                                <div className="overflow-hidden min-w-0">
                                    <UserHoverCard
                                        user={post.author}
                                        userState={parentUserState}
                                        dispatch={parentDispatch}
                                    />
                                </div>
                                <p className='overflow-hidden'>@{post.author.username}</p>
                                <p className='w-fit'>·</p>
                                <PostDate createdAt={post.createdAt} />
                            </div>
                            <div className='w-full h-fit min-w-[1%] break-words whitespace-normal flex flex-col'>
                                <PostText content={post.replyTo!.content} />
                                <PostImages
                                    images={post.replyTo!.images}
                                    authorUsername={post.replyTo!.author.username}
                                    postId={post.replyTo!.id}
                                    openPhoto={openPhoto} />
                            </div>
                        </div>
                    </div>
                </div>

            </BasicPostTemplate>
        </div >
    )
}
