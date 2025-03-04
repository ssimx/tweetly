'use client';
import UserHoverCard from '../misc/UserHoverCard';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContextProvider';
import { BasicPostType, UserInfoType } from '@/lib/types';
import PostMenu from '../posts/post-parts/PostMenu';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { Repeat2 } from 'lucide-react';
import BasicPostTemplate from '../posts/templates/BasicPostTemplate';

export default function NotificationRepost({ post, notifier, isRead }: { post: BasicPostType, notifier: UserInfoType, isRead: boolean }) {
    const { suggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // USER WHO REPOSTED

    // If notifier is in suggestions, track it's isFollowed property instead
    const [isNotifierFollowedByTheUser, setNotifierIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === notifier.username)?.isFollowed
        ?? notifier.followers.length === 1
        ?? false
    );

    // Is notifier following the logged in user, notifier can't be blocked in hoverCard so no need for setter function
    const [isNotifierFollowingTheUser,] = useState<boolean>(notifier.following.length === 1);

    // Notifier following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [notifierFollowingCount,] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === notifier.username)?._count.following
        ?? notifier._count.following
        ?? 0
    );
    const [notifierFollowersCount, setNotifierFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === notifier.username)?._count.followers
        ?? notifier._count.followers
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
        const suggestedUsers = suggestions?.filter((suggestedUser) => suggestedUser.username === notifier.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === notifier.username) {
                    setNotifierIsFollowedByTheUser(suggestedUsers[index].relationship.isFollowedByViewer);
                    setNotifierFollowersCount(suggestedUsers[index]._count.followers);
                } else if (user.username === post.author.username) {
                    setIsFollowedByTheUser(suggestedUsers[index].relationship.isFollowedByViewer);
                    setFollowingCount(suggestedUsers[index]._count.following);
                    setFollowersCount(suggestedUsers[index]._count.followers);
                }
            });
        }
    }, [suggestions, post, notifier]);

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
                <Repeat2 size={20} className='text-green-500/70 mr-1' />

                <UserHoverCard
                    user={notifier}
                    _followingCount={notifierFollowingCount}
                    _followersCount={notifierFollowersCount}
                    _setFollowersCount={setNotifierFollowersCount}
                    isFollowedByTheUser={isNotifierFollowedByTheUser}
                    setIsFollowedByTheUser={setNotifierIsFollowedByTheUser}
                    isFollowingTheUser={isNotifierFollowingTheUser} />

                <p className='font-semibold'>reposted {post.author.username === loggedInUser.username && 'your post'}</p>
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
            />

        </div>
    )
}
