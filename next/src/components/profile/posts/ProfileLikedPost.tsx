'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BasicPostType } from '@/lib/types';
import BasicPostTemplate from '../../posts/BasicPostTemplate';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';

export default function ProfileLikedPost({ post }: { post: BasicPostType }) {
    const { suggestions } = useFollowSuggestionContext();
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
    }, [suggestions, post]);

    // - FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

    return (
        <div
            className='w-full flex flex-col gap-2 px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
            role="link"
            tabIndex={0}
            aria-label={`View post by ${post.author.username}`}
            onClick={(e) => handleCardClick(e, post.author.username, post.id)} >

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
