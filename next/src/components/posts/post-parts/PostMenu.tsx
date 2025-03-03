'use client';
import { blockUser, followUser, unblockUser, unfollowUser } from '@/actions/actions';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useUserContext } from '@/context/UserContextProvider';
import { UserActionType } from '@/lib/userReducer';
import { Ellipsis } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BasePostDataType, getErrorMessage, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';

type PostMenuProps = {
    post: BasePostDataType,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
}

export default function PostMenu({ post, userState, dispatch }: PostMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const followBtn = useRef<HTMLButtonElement | null>(null);
    const blockBtn = useRef<HTMLButtonElement | null>(null);

    const { loggedInUser, setNewFollowing, setFollowersCount, setFollowingCount } = useUserContext();
    const { updateFollowState: updateSuggestedUserFollowState } = useFollowSuggestionContext();
    const { addBlockedUser, removeBlockedUser } = useBlockedUsersContext();

    const {
        isBlockedByViewer,
        isFollowingViewer,
        isFollowedByViewer
    } = userState.relationship;

    const authorIsLoggedInUser = post.author.username === loggedInUser.username;

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!menuOpen) {
            // Disable interaction behind the menu when it's opened
            document.body.classList.add('disable-interaction');
        } else {
            // Re-enable interaction when the menu is closed
            document.body.classList.remove('disable-interaction');
        }

        setMenuOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuBtn.current && !menuBtn.current.contains(event.target as Node)) {
            setMenuOpen(false);
            document.body.classList.remove('disable-interaction'); // Enable interaction again
        }
    };

    const handleFollowToggle = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            if (isSubmitting) return;
            setIsSubmitting(true);

            try {
                if (isFollowedByViewer) {
                    // Optimistically update UI
                    dispatch({ type: 'UNFOLLOW' });
                    updateSuggestedUserFollowState(post.author.username, false);

                    const response = await unfollowUser(post.author.username);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                } else {
                    // Optimistically update UI
                    dispatch({ type: 'FOLLOW' });
                    setNewFollowing(true);
                    updateSuggestedUserFollowState(post.author.username, true);

                    isFollowingViewer && setFollowersCount((current) => current - 1);
                    isFollowedByViewer && setFollowingCount((current) => current - 1);

                    const response = await followUser(post.author.username);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                }
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                // Revert state if exception occurs
                if (isFollowedByViewer) {
                    console.error(`Error unfollowing the user:`, errorMessage);
                    dispatch({ type: 'FOLLOW' });
                    updateSuggestedUserFollowState(post.author.username, true);
                } else {
                    console.error(`Error following the user:`, errorMessage);
                    dispatch({ type: 'UNFOLLOW' });
                    setNewFollowing(false);
                    updateSuggestedUserFollowState(post.author.username, false);
                    isFollowingViewer && setFollowersCount((current) => current + 1);
                    isFollowedByViewer && setFollowingCount((current) => current + 1);
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            isFollowedByViewer,
            dispatch,
            post.author,
            isSubmitting,
            setNewFollowing,
            isFollowingViewer,
            setFollowersCount,
            setFollowingCount,
            updateSuggestedUserFollowState,
        ],
    );

    const handleBlockToggle = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            if (isSubmitting) return;
            setIsSubmitting(true);

            try {
                if (isBlockedByViewer) {
                    // Optimistically update UI
                    dispatch({ type: 'UNBLOCK' });
                    removeBlockedUser(post.author.username);

                    const response = await unblockUser(post.author.username);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                } else {
                    // Optimistically update UI
                    dispatch({ type: 'BLOCK' });
                    addBlockedUser(post.author.username);
                    setNewFollowing(true);
                    isFollowingViewer && setFollowersCount((current) => current - 1);
                    isFollowedByViewer && setFollowingCount((current) => current - 1);

                    const response = await blockUser(post.author.username);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                }
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                // Revert state if exception occurs
                if (isBlockedByViewer) {
                    console.error(`Error unblocking the user:`, errorMessage);
                    dispatch({ type: 'BLOCK' });
                    addBlockedUser(post.author.username);
                } else {
                    console.error(`Error blocking the user:`, errorMessage);
                    dispatch({ type: 'UNBLOCK' });
                    removeBlockedUser(post.author.username);
                    setNewFollowing(false);
                    isFollowingViewer && setFollowersCount((current) => current + 1);
                    isFollowedByViewer && setFollowingCount((current) => current + 1);
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            isBlockedByViewer,
            dispatch,
            post.author,
            addBlockedUser,
            removeBlockedUser,
            isSubmitting,
            setNewFollowing,
            isFollowedByViewer,
            isFollowingViewer,
            setFollowersCount,
            setFollowingCount,
        ],
    );

    const pinPost = () => {
        console.log('Pin post');
    };

    const removePost = () => {
        console.log('Remove post');
    };

    const reportPost = () => {
        console.log('Report post');
    };

    useEffect(() => {
        if (menuOpen) {
            window.addEventListener('click', handleClickOutside);
        } else {
            window.removeEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
        };
    }, [menuOpen]);

    return (
        <div className='ml-auto w-[30px] h-[25px] relative flex-center'>
            {menuOpen &&
                <>
                    <button className='menu-overlay' onClick={toggleMenu}></button>

                    <div ref={menuBtn} className='shadow-menu bg-primary-foreground text-primary-text border border-primary-border overflow-hidden absolute top-0 right-[0%] z-50 w-[200px] h-fit rounded-[20px] py-[10px]'>
                        {authorIsLoggedInUser
                            ? (
                                <>
                                    <button onClick={pinPost}
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'>
                                        Pin post to profile
                                    </button>

                                    <button onClick={removePost}
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] text-red-600 hover:bg-card-hover'>
                                        Delete post
                                    </button>
                                </>)
                            : (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                        ref={followBtn}>
                                        {isFollowedByViewer ? `Unfollow ${post.author.username}` : `Follow ${post.author.username}`}
                                    </button>

                                    <button
                                        onClick={handleBlockToggle}
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                        ref={blockBtn}>
                                        {isBlockedByViewer ? `Unblock ${post.author.username}` : `Block ${post.author.username}`}
                                    </button>

                                    <button onClick={reportPost}
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'>
                                        Report post
                                    </button>
                                </>
                            )
                        }
                    </div>
                </>
            }

            <button className='group' onClick={toggleMenu}>
                <Ellipsis size={20} className='group-hover:text-primary' />
            </button>
        </div>
    )
}
