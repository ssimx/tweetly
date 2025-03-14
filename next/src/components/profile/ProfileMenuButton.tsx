'use client';
import { blockUser, unblockUser } from '@/actions/actions';
import { UserActionType } from '@/lib/userReducer';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { Ellipsis, Link, Ban, CircleOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { useUserContext } from '@/context/UserContextProvider';

type ProfileMenuButtonProps = {
    user: string,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

// this button can be displayed on user profile
//      - relationship: block/unblock user
//      - other things such as copy profile link
// or inside a post
//      - relationship: block/unblock, follow/unfollow user, notifications
//      - other things such as copy post link

export default function ProfileMenuButton({ user, userState, dispatch }: ProfileMenuButtonProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const blockBtn = useRef<HTMLButtonElement | null>(null);
    const copyProfileUrlAlert = useRef<HTMLDivElement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        isBlockedByViewer,
        isFollowingViewer,
        isFollowedByViewer
    } = userState.relationship;

    const { setNewFollowing, setFollowingCount, setFollowersCount } = useUserContext();
    const { addBlockedUser, removeBlockedUser } = useBlockedUsersContext();

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);

        if (!menuOpen) {
            // Disable interaction behind the menu when it's opened
            document.body.classList.add('disable-interaction');
        } else {
            // Re-enable interaction when the menu is closed
            document.body.classList.remove('disable-interaction');
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuBtn.current && !menuBtn.current.contains(event.target as Node)) {
            setMenuOpen(false);
            document.body.classList.remove('disable-interaction'); // Enable interaction again
        }
    };

    const handleCopyLink = () => {
        const url = window.location.origin;
        const profileUrl = `${url}/${user}`;
        navigator.clipboard.writeText(profileUrl);
        setMenuOpen((prev) => !prev);
        copyProfileUrlAlert.current?.classList.toggle('hidden');

        setTimeout(() => {
            copyProfileUrlAlert.current?.classList.toggle('hidden');
        }, 3000);
    };

    const handleBlockToggle = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            if (isSubmitting) return;
            setIsSubmitting(true);
            setMenuOpen(false);

            try {
                if (isBlockedByViewer) {
                    // Optimistically update UI
                    dispatch({ type: 'UNBLOCK' });
                    removeBlockedUser(user);

                    const response = await unblockUser(user);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                } else {
                    // Optimistically update UI
                    dispatch({ type: 'BLOCK' });
                    addBlockedUser(user);
                    setNewFollowing(true);
                    isFollowingViewer && setFollowersCount((current) => current - 1);
                    isFollowedByViewer && setFollowingCount((current) => current - 1);

                    const response = await blockUser(user);

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
                    addBlockedUser(user);
                } else {
                    console.error(`Error blocking the user:`, errorMessage);
                    dispatch({ type: 'UNBLOCK' });
                    removeBlockedUser(user);
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
            user,
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
        <div className='profile-menu'>
            {menuOpen &&
                <>
                    <div className='menu-overlay' onClick={toggleMenu}></div>

                    <div ref={menuBtn} className='profile-opened-menu'>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink();
                            }}
                            className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-card-hover'>
                            <Link size={20} className='text-primary-text' />
                            Copy link to profile
                        </button>
                        {
                            userState.relationship.isBlockedByViewer
                                ? (
                                    <button
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-card-hover'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBlockToggle(e);
                                        }}
                                        ref={blockBtn}
                                        disabled={isSubmitting}
                                    >
                                        <CircleOff size={20} className='text-primary-text' />
                                        Unblock @{user}
                                    </button>
                                )
                                : <button
                                    className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[10px] hover:bg-card-hover'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBlockToggle(e);
                                    }}
                                    ref={blockBtn}
                                    disabled={isSubmitting}
                                >
                                    <Ban size={20} className='text-primary-text' />
                                    Block @{user}
                                </button>
                        }
                    </div>
                </>
            }

            <button className='profile-menu-btn'
                onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(e);
                }}
            >
                <Ellipsis size={20} className='text-primary-text' />
            </button>

            <div className='profile-copy-alert hidden'
                ref={copyProfileUrlAlert} >
                Copied to clipboard
            </div>
        </div>
    )
}