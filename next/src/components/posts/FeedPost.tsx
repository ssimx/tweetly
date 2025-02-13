'use client';
import { BasicPostType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import PostMenu from './PostMenu';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import BasicPostTemplate from './BasicPostTemplate';

export default function FeedPost({ post, searchSegments }: { post: BasicPostType, searchSegments?: string[] }) {
    const { suggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

    useEffect(() => {
        const suggestedUser = suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username);
        if (suggestedUser) {
            setIsFollowedByTheUser(suggestedUser.isFollowed);
            setFollowingCount(suggestedUser._count.following);
            setFollowersCount(suggestedUser._count.followers);
        }
    }, [suggestions, post.author.username]);

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
            className='px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
            role="link"
            tabIndex={0}
            aria-label={`View post by ${post.author.username}`}
            onMouseDown={(e) => handleCardClick(e, post.author.username, post.id)} >

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
                searchSegments={searchSegments}
            />

        </div>
    )
}
