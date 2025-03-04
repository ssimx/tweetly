'use client';
import UserHoverCard from '../misc/UserHoverCard';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContextProvider';
import { ReplyPostType } from '@/lib/types';
import PostMenu from '../posts/post-parts/PostMenu';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import BasicPostTemplate from '../posts/templates/BasicPostTemplate';
import { Reply } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PostDate from '../posts/post-parts/PostDate';
import PostText from '../posts/post-parts/PostText';
import PostImages from '../posts/post-parts/PostImages';

export default function NotificationReply({ post, isRead }: { post: ReplyPostType, isRead: boolean }) {
    const { suggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // REPLIED TO POST

    // If notifier is in suggestions, track it's isFollowed property instead
    const [isParentFollowedByTheUser, setParentIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo.author.username)?.isFollowed
        ?? post.replyTo.author.followers.length === 1
        ?? false
    );

    // Is reply following the logged in user, reply can't be blocked in hoverCard so no need for setter function
    const [isParentFollowingTheUser,] = useState<boolean>(post.replyTo.author.following.length === 1);

    // Reply following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [parentFollowingCount,] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo.author.username)?._count.following
        ?? post.replyTo.author._count.following
        ?? 0
    );
    const [parentFollowersCount, setParentFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo.author.username)?._count.followers
        ?? post.replyTo.author._count.followers
        ?? 0
    );

    // ORIGINAL POST

    // if user is in suggestions, track it's isFollowed property instead
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?.isFollowed
        ?? post.author.followers.length === 1
    );
    // Is post author following the logged in user

    const [isFollowingTheUser, setIsFollowingTheUser] = useState<boolean>(post.author.following.length === 1);

    // Post author following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [followingCount, setFollowingCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.following
        ?? post.author._count.following
    );
    const [followersCount, setFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.followers
        ?? post.author._count.followers
    );
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const suggestedUsers = suggestions?.filter((suggestedUser) => suggestedUser.username === post.replyTo.author.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === post.replyTo.author.username) {
                    setParentIsFollowedByTheUser(suggestedUsers[index].relationship.isFollowedByViewer);
                    setParentFollowersCount(suggestedUsers[index]._count.followers);
                } else if (user.username === post.author.username) {
                    setIsFollowedByTheUser(suggestedUsers[index].relationship.isFollowedByViewer);
                    setFollowingCount(suggestedUsers[index]._count.following);
                    setFollowersCount(suggestedUsers[index]._count.followers);
                }
            });
        }
    }, [suggestions, post]);

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
        router.push(`http://localhost:3000/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
    };

    const changeCardColor = () => {
        cardRef.current !== null && cardRef.current.classList.remove('bg-secondary-foreground');
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    if (blockedUsers.some((user) => user === post.author.username)) {
        return (
            <div className="w-full px-4 py-2 flex">
                <p className="text-secondary-text">You&apos;ve blocked this user. <span>Unblock to see their posts.</span></p>
                <PostMenu
                    post={post}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser}
                    isFollowingTheUser={isFollowingTheUser}
                    setIsFollowingTheUser={setIsFollowingTheUser}
                    _setFollowersCount={setFollowersCount}
                    _setFollowingCount={setFollowingCount}
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
                    _followingCount={followingCount}
                    _followersCount={followersCount}
                    _setFollowersCount={setFollowersCount}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser}
                    isFollowingTheUser={isFollowingTheUser} />

                <p className='font-semibold'>replied {post.author.username === loggedInUser.username && 'to your post'}</p>
            </div>

            <BasicPostTemplate
                post={post}
                isFollowedByTheUser={isFollowedByTheUser}
                setIsFollowedByTheUser={setIsFollowedByTheUser}
                isFollowingTheUser={isFollowingTheUser}
                setIsFollowingTheUser={setIsFollowingTheUser}
                followingCount={followingCount}
                setFollowingCount={setFollowingCount}
                followersCount={followersCount}
                setFollowersCount={setFollowersCount}
                openPhoto={openPhoto}
            >

                <div
                    className='mt-2 w-full border rounded-xl p-2 flex flex-row items-center gap-2 hover:bg-post-hover cursor-pointer'
                    onClick={(e) => handleCardClick(e, post.replyTo.author.username, post.replyTo.id)}
                >
                    <div className='w-full grid grid-cols-post-layout grid-rows-1 gap-2'>
                        <div className='w-auto h-full'>
                            <Link
                                className='flex group' onClick={(e) => e.stopPropagation()}
                                href={`/${post.replyTo.author.username}`}
                            >
                                <Image
                                    className='w-[24px] h-[24px] rounded-full group-hover:outline group-hover:outline-primary/10'
                                    src={post.replyTo.author.profile.profilePicture}
                                    alt='Post author profile pic'
                                    width={24} height={24}
                                />
                            </Link>
                        </div>
                        <div className='w-full flex flex-col min-w-0'>
                            <div className='flex gap-2 text-secondary-text'>
                                <UserHoverCard
                                    user={post.replyTo.author}
                                    _followingCount={parentFollowingCount}
                                    _followersCount={parentFollowersCount}
                                    _setFollowersCount={setParentFollowersCount}
                                    isFollowedByTheUser={isParentFollowedByTheUser}
                                    setIsFollowedByTheUser={setParentIsFollowedByTheUser}
                                    isFollowingTheUser={isParentFollowingTheUser} />
                                <p>@{post.replyTo.author.username}</p>
                                <p>·</p>
                                <PostDate createdAt={post.replyTo.createdAt} />
                            </div>
                            <div className='w-full h-fit min-w-[1%] break-words whitespace-normal flex flex-col'>
                                <PostText content={post.replyTo.content} />
                                <PostImages
                                    images={post.replyTo.images}
                                    authorUsername={post.replyTo.author.username}
                                    postId={post.replyTo.id}
                                    openPhoto={openPhoto} />
                            </div>
                        </div>
                    </div>
                </div>

            </BasicPostTemplate>
        </div >
    )
}
