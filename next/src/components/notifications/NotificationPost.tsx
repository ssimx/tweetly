'use client';
import { useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import BasicPostTemplate from '../posts/templates/BasicPostTemplate';
import { BasePostDataType } from 'tweetly-shared';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';

export default function NotificationPost({ post, isRead }: { post: BasePostDataType, isRead: boolean }) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const router = useRouter();

    const cardRef = useRef<HTMLDivElement>(null);

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // NOTIFIER/FOLLOWER
    const userInitialState: UserStateType = {
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
    const [userState, dispatch] = useReducer(userInfoReducer, userInitialState);

    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === post.author.username);
        if (suggestedUser) {
            dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
        }
    }, [userFollowSuggestions, dispatch, post.author.username]);

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

            <BasicPostTemplate
                post={post}
                userState={userState}
                dispatch={dispatch}
                openPhoto={openPhoto}
            />

        </div>
    )
}
