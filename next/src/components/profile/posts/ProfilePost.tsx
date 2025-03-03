'use client';
import { useEffect } from 'react';
import { Repeat2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useUserContext } from '@/context/UserContextProvider';
import BasicPostTemplate from '@/components/posts/templates/BasicPostTemplate';
import { ProfilePostOrRepostDataType, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { UserActionType } from '@/lib/userReducer';

type ProfilePostProps = {
    post: ProfilePostOrRepostDataType,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfilePost({ post, userState, dispatch }: ProfilePostProps) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();
    const path = usePathname();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // Profile post author is obviously same as profile user so they share userState

    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === post.author.username);
        if (suggestedUser) {
            dispatch({ type: suggestedUser.isFollowed ? 'FOLLOW' : 'UNFOLLOW' });
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

            {post.type === 'REPOST' && (
                <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                    <Repeat2 size={16} className='text-secondary-text' />
                    {path === `/${loggedInUser.username}`
                        ? <p>You reposted</p>
                        : <p>Reposted</p>
                    }
                </div>
            )}

            <BasicPostTemplate
                post={post}
                userState={userState}
                dispatch={dispatch}
                openPhoto={openPhoto}
            />

        </div>
    )
}
