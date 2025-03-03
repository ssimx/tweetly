'use client';
import { useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import BasicPostTemplate from '@/components/posts/templates/BasicPostTemplate';
import { BasePostDataType, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { UserActionType, userInfoReducer, UserStateType } from '@/lib/userReducer';

type ProfileReplyProps = {
    post: BasePostDataType,
    replyUserState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    replyDispatch: React.Dispatch<UserActionType>,
};

export default function ProfileReply({ post, replyUserState, replyDispatch }: ProfileReplyProps) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // PARENT POST IS NOT NECESSARILY PROFILE USER'S OWN POST SO IT NEEDS NEW STATE IF THAT'S THE CASE
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

    // ORIGINAL POST (REPLY) SHARES STATE WITH PROFILE USER

    useEffect(() => {
        const suggestedUsers = userFollowSuggestions?.filter((suggestedUser) => suggestedUser.username === post.replyTo?.author.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === post.replyTo?.author.username) {
                    parentDispatch({ type: suggestedUsers[index].isFollowed ? 'FOLLOW' : 'UNFOLLOW' });
                } else if (user.username === post.author.username) {
                    replyDispatch({ type: suggestedUsers[index].isFollowed ? 'FOLLOW' : 'UNFOLLOW' });
                }
            });

        }
    }, [userFollowSuggestions, replyDispatch, post]);

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
        <div className='w-full h-fit flex flex-col'>
            <div
                className='px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
                role="link"
                tabIndex={0}
                aria-label={`View post by ${post.author.username} that was replied to`}
                onMouseDown={(e) => handleCardClick(e, post.replyTo!.author.username, post.replyTo!.id)} >

                <BasicPostTemplate
                    post={post.replyTo!}
                    userState={post.replyTo!.author.username === post.author.username ? replyUserState : parentUserState}
                    dispatch={post.replyTo!.author.username === post.author.username ? replyDispatch : parentDispatch}
                    openPhoto={openPhoto}
                    type={'parent'}
                />

            </div>

            <div
                className='px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
                role="link"
                tabIndex={0}
                aria-label={`View reply post by ${post.author.username}`}
                onMouseDown={(e) => handleCardClick(e, post.author.username, post.id)} >

                <BasicPostTemplate
                    post={post}
                    userState={replyUserState}
                    dispatch={replyDispatch}
                    openPhoto={openPhoto}
                />

            </div>
        </div>
    )
}
