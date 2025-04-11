'use client';
import { useEffect } from 'react';
import { Pin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import BasicPostTemplate from '@/components/posts/templates/BasicPostTemplate';
import { ProfilePostOrRepostDataType, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { UserActionType } from '@/lib/userReducer';
import PostMenuButton from '@/components/posts/post-parts/PostMenuButton';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';

type ProfilePostProps = {
    post: ProfilePostOrRepostDataType,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfilePinnedPost({ post, userState, dispatch }: ProfilePostProps) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // POST SHARES STATE WITH PROFILE USER

    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)
        if (suggestedUser) {
            dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
        }
    }, [userFollowSuggestions, dispatch, post.author.username]);

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
        router.push(`${window.location.origin}/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    if (blockedUsers.some((user) => user === post.author.username)) {
        return (
            <div className="w-full px-4 py-2 flex">
                <p className="text-secondary-text">You&apos;ve blocked this user. <span>Unblock to see their posts.</span></p>
                <PostMenuButton
                    post={post}
                    userState={userState}
                    dispatch={dispatch}
                />
            </div>
        )
    }

    return (
        <div>
            <div
                className='w-full flex flex-col gap-2 px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
                role="link"
                tabIndex={0}
                aria-label={`View post by ${post.author.username}`}
                onClick={(e) => handleCardClick(e, post.author.username, post.id)} >
                <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                    <Pin size={16} className='text-primary' fill='hsl(var(--primary))' />
                    <p>Pinned</p>
                </div>
                <BasicPostTemplate
                    post={post}
                    userState={userState}
                    dispatch={dispatch}
                    openPhoto={openPhoto}
                />
            </div>
            <div className='feed-hr-line'></div>
        </div>
    )
}
