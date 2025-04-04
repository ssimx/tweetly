'use client';
import { blockUser, unblockUser } from '@/actions/actions';
import { UserActionType } from '@/lib/userReducer';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { Ellipsis, Link, Ban, CircleOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { useUserContext } from '@/context/UserContextProvider';
import { RemoveScroll } from 'react-remove-scroll';
import { useAlertMessageContext } from '@/context/AlertMessageContextProvider';
import { usePathname, useRouter } from 'next/navigation';

type ProfileMenuButtonProps = {
    user: string,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfileMenuButton({ user, userState, dispatch }: ProfileMenuButtonProps) {
    const { setAlertMessage } = useAlertMessageContext();
    const pathName = usePathname();
    const router = useRouter();

    const [menuOpen, setMenuOpen] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const blockBtn = useRef<HTMLButtonElement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        isBlockedByViewer,
        isFollowingViewer,
        isFollowedByViewer
    } = userState.relationship;

    const { setNewFollowing, setFollowingCount, setFollowersCount } = useUserContext();
    const { addBlockedUser, removeBlockedUser } = useBlockedUsersContext();

    const handleCopyLink = () => {
        const url = window.location.origin;
        const profileUrl = `${url}/${user}`;
        navigator.clipboard.writeText(profileUrl);
        setMenuOpen((prev) => !prev);
        setAlertMessage('Copied to clipboard');
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

                    if (pathName.endsWith(user)) {
                        router.refresh();
                    }

                    setAlertMessage('User unblocked');
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

                    if (pathName.endsWith(user)) {
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
                    addBlockedUser(user);

                    setAlertMessage('Failed to unblock the user');
                } else {
                    console.error(`Error blocking the user:`, errorMessage);
                    dispatch({ type: 'UNBLOCK' });
                    removeBlockedUser(user);
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
            user,
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
            router,
        ],
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

    useEffect(() => {
        if (menuOpen) {
            window.addEventListener('click', handleClickOutside);
            document.body.classList.add('disable-interaction');
            document.body.classList.add('overflow-y-none');
        } else {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
            document.body.classList.remove('overflow-y-none');
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('disable-interaction');
            document.body.classList.remove('overflow-y-none');
        };
    }, [menuOpen]);

    return (
        <div className='w-[38px] h-[38px] relative flex-center'>
            {menuOpen &&
                <>
                    <RemoveScroll>
                        <button className='fixed top-0 left-0 w-full h-full z-40 pointer-events-auto' onClick={toggleMenu}></button>
                    </RemoveScroll>

                    <div ref={menuBtn} className='shadow-menu bg-primary-foreground border border-primary-border overflow-hidden absolute top-[125%] right-[0%] z-50 w-[250px] h-fit rounded-[20px] py-[10px] pointer-events-none [&>button]:pointer-events-auto'>
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

            <button className='w-fit hover:bg-secondary-foreground text-primary-text border border-primary-border font-bold rounded-full p-2'
                onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(e);
                }}
            >
                <Ellipsis size={20} className='text-primary-text' />
            </button>

        </div>
    )
}