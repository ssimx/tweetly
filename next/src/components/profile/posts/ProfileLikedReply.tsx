'use client';
import { useEffect, useReducer } from 'react';
import { Reply } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import BasicPostTemplate from '@/components/posts/templates/BasicPostTemplate';
import UserHoverCard from '@/components/misc/UserHoverCard';
import { UserActionType, userInfoReducer, UserStateType } from '@/lib/userReducer';
import { BasePostDataType, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import PostMenuButton from '@/components/posts/post-parts/PostMenuButton';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';

type ProfileLikedReplyProps = {
    profileUsername: string,
    post: BasePostDataType,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfileLikedReply({ profileUsername, post, userState, dispatch }: ProfileLikedReplyProps) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
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
    const [_parentUserState, _parentDispatch] = useReducer(userInfoReducer, parentInitialState);

    const parentPostAuthorIsProfileUser = post.replyTo!.author.username === profileUsername;

    // LIKED POST IS NOT NECESSARILY PROFILE USER'S OWN POST SO IT NEEDS NEW STATE IF THAT'S THE CASE
    const replyInitialState: UserStateType = {
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
    const [_replyUserState, _replyDispatch] = useReducer(userInfoReducer, replyInitialState);

    const replyPostAuthorIsProfileUser = post.author.username === profileUsername;

    useEffect(() => {
        const suggestedUsers = userFollowSuggestions?.filter((suggestedUser) => suggestedUser.username === post.replyTo?.author.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === post.replyTo?.author.username) {
                    parentPostAuthorIsProfileUser
                        ? dispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' })
                        : _parentDispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
                } else if (user.username === post.author.username) {
                    replyPostAuthorIsProfileUser
                        ? dispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' })
                        : _replyDispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
                }
            });

        }
    }, [userFollowSuggestions, post, dispatch, parentPostAuthorIsProfileUser, replyPostAuthorIsProfileUser]);

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
        router.push(`http://192.168.1.155:3000/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
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
        <div
            className='w-full flex flex-col gap-2 px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
            role="link"
            tabIndex={0}
            aria-label={`View post by ${post.author.username}`}
            onClick={(e) => handleCardClick(e, post.author.username, post.id)} >

            <div
                className='flex items-center gap-1 text-14 text-secondary-text'
                onClick={(e) => handleCardClick(e, post.replyTo!.author.username, post.replyTo!.id)} >

                <Reply size={16} className='text-secondary-text' />
                <div className='flex gap-x-1'>
                    <p className='flex items-center gap-1'>Reply to </p>
                    <UserHoverCard
                        user={post.replyTo!.author}
                        userState={replyPostAuthorIsProfileUser ? userState : _parentUserState}
                        dispatch={replyPostAuthorIsProfileUser ? dispatch : _parentDispatch}
                    />
                </div>
            </div>

            <BasicPostTemplate
                post={post}
                userState={replyPostAuthorIsProfileUser ? userState : _replyUserState}
                dispatch={replyPostAuthorIsProfileUser ? dispatch : _replyDispatch}
                openPhoto={openPhoto}
            />

        </div>
    )
}
