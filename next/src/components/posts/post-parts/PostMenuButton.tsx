'use client';
import { blockUser, followUser, unblockUser, unfollowUser } from '@/actions/actions';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useUserContext } from '@/context/UserContextProvider';
import { UserActionType } from '@/lib/userReducer';
import { Ellipsis } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BasePostDataType, getErrorMessage, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { RemoveScroll } from 'react-remove-scroll';
import { useAlertMessageContext } from '@/context/AlertMessageContextProvider';
import { redirect, usePathname, useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { usePostInteraction } from '@/context/PostInteractionContextProvider';

type PostMenuProps = {
    post: BasePostDataType,
    setPostIsRemoved?: React.Dispatch<React.SetStateAction<boolean>>,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function PostMenuButton({ post, setPostIsRemoved, userState, dispatch }: PostMenuProps) {
    const { loggedInUser, setNewFollowing, setFollowersCount, setFollowingCount } = useUserContext();
    const { updateFollowState: updateSuggestedUserFollowState } = useFollowSuggestionContext();
    const { blockedUsers, addBlockedUser, removeBlockedUser } = useBlockedUsersContext();
    const { setAlertMessage } = useAlertMessageContext();
    const { interaction, togglePin, deletePost } = usePostInteraction(post);
    const pathName = usePathname();
    const router = useRouter();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const followBtn = useRef<HTMLButtonElement | null>(null);
    const blockBtn = useRef<HTMLButtonElement | null>(null);
    const [userWasBlocked, setUserWasBlocked] = useState(false);
    const [showScrollbar, setShowScrollbar] = useState(true);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);

    const {
        isBlockedByViewer,
        isFollowingViewer,
        isFollowedByViewer
    } = userState.relationship;

    const authorIsLoggedInUser = post.author.username === loggedInUser.username;

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

                    setAlertMessage('User unfollowed');
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

                    setAlertMessage('User followed');
                }
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                // Revert state if exception occurs
                if (isFollowedByViewer) {
                    console.error(`Error unfollowing the user:`, errorMessage);
                    dispatch({ type: 'FOLLOW' });
                    updateSuggestedUserFollowState(post.author.username, true);

                    setAlertMessage('Failed to unfollow the user');
                } else {
                    console.error(`Error following the user:`, errorMessage);
                    dispatch({ type: 'UNFOLLOW' });
                    setNewFollowing(false);
                    updateSuggestedUserFollowState(post.author.username, false);
                    isFollowingViewer && setFollowersCount((current) => current + 1);
                    isFollowedByViewer && setFollowingCount((current) => current + 1);

                    setAlertMessage('Failed to follow the user');
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
            setAlertMessage,
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

                    if (pathName.endsWith(post.author.username)) {
                        router.refresh();
                    }

                    setAlertMessage('User unblocked');
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

                    if (pathName.endsWith(post.author.username)) {
                        router.refresh();
                    }

                    setAlertMessage('User blocked');
                }
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                // Revert state if exception occurs
                if (isBlockedByViewer) {
                    console.error(`Error unblocking the user:`, errorMessage);
                    dispatch({ type: 'BLOCK' });
                    addBlockedUser(post.author.username);

                    setAlertMessage('Failed to unblock the user');
                } else {
                    console.error(`Error blocking the user:`, errorMessage);
                    dispatch({ type: 'UNBLOCK' });
                    removeBlockedUser(post.author.username);
                    setNewFollowing(false);
                    isFollowingViewer && setFollowersCount((current) => current + 1);
                    isFollowedByViewer && setFollowingCount((current) => current + 1);

                    setAlertMessage('Failed to block the user');
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
            setAlertMessage,
            pathName,
            router
        ],
    );

    const removePostAlert = () => {
        if (pathName.includes('photo')) document.body.classList.add('alert-modal-hidden-y-scroll');
        setAlertDialogOpen(true);
    };

    const handlePostInteraction = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            e.preventDefault();

            const btn = e.currentTarget;
            const type = btn.dataset.type as 'pin' | 'delete';

            btn.disabled = true;
            let success = true;

            switch (type) {
                case 'pin':
                    success = await togglePin();
                    if (!success) {
                        setAlertMessage(`Failed to ${interaction.pinned ? 'unpin' : 'pin'} the post`);
                        break;
                    }

                    setAlertMessage(interaction.pinned ? 'Post unpinned' : 'Post pinned');
                    break;
                case 'delete':
                    success = await deletePost();
                    if (!success) {
                        setAlertMessage(`Failed to delete the post`);
                        break;
                    }

                    setAlertMessage('Post deleted');

                    // check if post is visited and redirect user to the home page
                    // othwerise just hide the post from the feed
                    if (pathName.includes(`${post.author.username}/status/${post.id}`)) {
                        redirect('/');
                    } else {
                        setPostIsRemoved && setPostIsRemoved(true);
                    }

                    break;
                default:
                    setAlertMessage(`Something went wrong`);
                    success = false;
            }

            setAlertDialogOpen(false);
            document.body.classList.remove('alert-modal-hidden-y-scroll');

            // Re-enable the button
            btn.disabled = false;
        }, [setAlertMessage, togglePin, deletePost, interaction, setPostIsRemoved, pathName, post.author.username, post.id]
    );

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuBtn.current && !menuBtn.current.contains(event.target as Node)) {
            setMenuOpen(false);
            document.body.classList.remove('disable-interaction'); // Enable interaction again
        }
    };

    // For tracking whether author was blocked on another post
    useEffect(() => {
        if (blockedUsers.some((user) => user === post.author.username) && !isBlockedByViewer) {
            dispatch({ type: 'BLOCK' });
            setUserWasBlocked(true);
        } else if (isBlockedByViewer && userWasBlocked && !blockedUsers.some((user) => user === post.author.username)) {
            dispatch({ type: 'UNBLOCK' });
            setUserWasBlocked(false);
        }
    }, [post.author.username, blockedUsers, dispatch, isBlockedByViewer, userWasBlocked]);

    // For tracking whether overlay is opened, to hide background scrollbar
    useEffect(() => {
        if (pathName.includes('photo')) {
            setShowScrollbar(false);
        } else {
            setShowScrollbar(true);
        }
    }, [pathName]);

    useEffect(() => {
        if (menuOpen) {
            window.addEventListener('click', handleClickOutside);
            document.body.classList.add('disable-interaction');
        } else {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
        };
    }, [menuOpen]);

    return (
        <>
            <div className='ml-auto w-[30px] h-[25px] relative flex-center'>
                {menuOpen &&
                    <>
                        {showScrollbar === false
                            ? (
                                <button className='fixed top-0 left-0 w-full h-full z-40 pointer-events-auto bla' onClick={toggleMenu}></button>
                            )
                            : (
                                <RemoveScroll>
                                    <button className='fixed top-0 left-0 w-full h-full z-40 pointer-events-auto' onClick={toggleMenu}></button>
                                </RemoveScroll>
                            )}
                        <div
                            ref={menuBtn}
                            className='shadow-menu bg-primary-foreground text-primary-text border border-primary-border overflow-hidden absolute top-0 right-[0%] z-50 w-[200px] h-fit rounded-[20px] py-[10px] pointer-events-none [&>button]:pointer-events-auto'
                        >
                            {authorIsLoggedInUser
                                ? (
                                    <>
                                        <button
                                            className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                            data-type='pin'
                                            disabled={isSubmitting}
                                            onClick={(e) => handlePostInteraction(e)}
                                        >
                                            {`${interaction.pinned ? 'Unpin post from profile' : 'Pin post to profile'}`}
                                        </button>
                                        <button
                                            className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] text-red-600 hover:bg-card-hover'
                                            disabled={isSubmitting}
                                            onClick={removePostAlert}
                                        >
                                            Delete post
                                        </button>
                                    </>)
                                : (
                                    <>
                                        {isBlockedByViewer
                                            ? (
                                                <>
                                                    <button
                                                        onClick={handleBlockToggle}
                                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                                        ref={blockBtn}
                                                        disabled={isSubmitting}
                                                    >
                                                        {`Unblock ${post.author.username}`}
                                                    </button>
                                                </>
                                            )
                                            : (
                                                <>
                                                    <button
                                                        onClick={handleFollowToggle}
                                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                                        ref={followBtn}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isFollowedByViewer ? `Unfollow ${post.author.username}` : `Follow ${post.author.username}`}
                                                    </button>
                                                    <button
                                                        onClick={handleBlockToggle}
                                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                                        ref={blockBtn}
                                                        disabled={isSubmitting}
                                                    >
                                                        {`Block ${post.author.username}`}
                                                    </button>
                                                </>
                                            )
                                        }
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

            <AlertDialog
                open={alertDialogOpen}
            >
                <AlertDialogContent
                    className='bg-primary-foreground'
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className='text-secondary-text font-medium'>
                            This action cannot be undone. This will permanently delete the post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='bg-primary-foreground' onClick={() => setAlertDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className='bg-primary text-white-1 font-bold'
                            data-type='delete'
                            onClick={(e) => handlePostInteraction(e)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
