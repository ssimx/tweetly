'use client';
import { useEffect, useReducer } from 'react';
import { Repeat2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import BasicPostTemplate from '@/components/posts/templates/BasicPostTemplate';
import { ProfilePostOrRepostDataType, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { UserActionType, userInfoReducer, UserStateType } from '@/lib/userReducer';

type ProfilePostProps = {
    profileUsername: string,
    post: ProfilePostOrRepostDataType,
    authorized: boolean,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfileRepost({ profileUsername, post, authorized, userState, dispatch }: ProfilePostProps) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // REPOSTED POST IS NOT NECESSARILY PROFILE USER'S OWN POST SO IT NEEDS NEW STATE IF THAT'S THE CASE
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
    const [_userState, _dispatch] = useReducer(userInfoReducer, userInitialState);

    const postAuthorIsProfileUser = post.author.username === profileUsername;

    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === post.author.username);
        if (suggestedUser) {
            postAuthorIsProfileUser
                ? dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' })
                : _dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
        }
    }, [userFollowSuggestions, post, postAuthorIsProfileUser, dispatch]);

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

            <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                <Repeat2 size={16} className='text-secondary-text' />
                {authorized
                    ? <p>You reposted</p>
                    : <p>Reposted</p>
                }
            </div>

            <BasicPostTemplate
                post={post}
                userState={postAuthorIsProfileUser ? userState : _userState}
                dispatch={postAuthorIsProfileUser ? dispatch : _dispatch}
                openPhoto={openPhoto}
            />

        </div>
    )
}
