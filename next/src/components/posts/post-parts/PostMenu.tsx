'use client';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useUserContext } from '@/context/UserContextProvider';
import { BasicPostType } from '@/lib/types';
import { Ellipsis } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from 'tweetly-shared';

interface PostMenuType {
    post: BasicPostType,
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    isFollowingTheUser: boolean,
    setIsFollowingTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    _setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    _setFollowingCount: React.Dispatch<React.SetStateAction<number>>,
}

export default function PostMenu({ post, isFollowedByTheUser, setIsFollowedByTheUser, isFollowingTheUser, setIsFollowingTheUser}: PostMenuType) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const menuBtn = useRef<HTMLDivElement | null>(null);
    const followBtn = useRef<HTMLButtonElement | null>(null);
    const blockBtn = useRef<HTMLButtonElement | null>(null);

    const { loggedInUser, setFollowersCount, setFollowingCount } = useUserContext();
    const { updateFollowState } = useFollowSuggestionContext();
    const { blockedUsers, addBlockedUser, removeBlockedUser } = useBlockedUsersContext();
    const isBlockedByTheUser = blockedUsers.some((user) => user === post.author.username);
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

    const pinPost = () => {
        console.log('test')
    };

    const removePost = () => {

    };

    const reportPost = () => {

    };
 
    const handleFollowUser = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        followBtn.current && followBtn.current.setAttribute('disabled', "");

        try {
            if (isFollowedByTheUser) {
                // optimistic change
                setIsFollowedByTheUser(false);
                setFollowersCount((current) => current - 1);
                updateFollowState(post.author.username, false);

                const unfollow = await fetch(`/api/users/removeFollow/${post.author.username}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!unfollow.ok) {
                    throw new Error("Couldn't unfollow the user");
                }
            } else {
                // optimistic change
                setIsFollowedByTheUser(true);
                setFollowersCount((current) => current + 1);
                updateFollowState(post.author.username, true);

                const follow = await fetch(`/api/users/follow/${post.author.username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!follow.ok) {
                    throw new Error("Couldn't follow the user");
                }
            }

        } catch (error) {
            console.error(getErrorMessage(error));
            if (isFollowedByTheUser) {
                // revert the changes in case of error
                setIsFollowedByTheUser(true);
                // setFollowersCount((current) => current + 1);
                updateFollowState(post.author.username, true);
            } else {
                // revert the changes in case of error
                setIsFollowedByTheUser(false);
                // setFollowersCount((current) => current - 1);
                updateFollowState(post.author.username, false);
            }
        } finally {
            followBtn.current && followBtn.current.removeAttribute('disabled');
            setIsSubmitting(false);
        }
    };

    const handleBlockUser = async () => {
        if (isBlockedByTheUser) {
            try {
                const response = await fetch(`/api/users/removeBlock/${post.author.username}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error('User is not blocked');
                    return;
                }

                removeBlockedUser(post.author.username);
            } catch (error) {
                console.error('Something went wrong');
            }
        } else {
            try {
                const response = await fetch(`/api/users/block/${post.author.username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error('User is already blocked');
                    return;
                }

                // If logged in user is following the blocked user, decrease their followers count
                isFollowedByTheUser && setFollowersCount((prev) => prev - 1);
                isFollowedByTheUser && setIsFollowedByTheUser(false);
                // If blocked user is following logged in user, set "follows you" to false and decrease logged in user followers count
                isFollowingTheUser && setIsFollowingTheUser(false);
                isFollowingTheUser && setFollowingCount((prev) => prev - 1);

                updateFollowState(post.author.username, false);
                addBlockedUser(post.author.username);
                setMenuOpen(false);
            } catch (error) {
                console.error('Something went wrong');
            }
        }
    };

    return (
        <div className='ml-auto w-[30px] h-[25px] relative flex-center'>
            {menuOpen &&
                <>
                    <button className='menu-overlay' onClick={toggleMenu}></button>

                    <div ref={menuBtn} className='shadow-menu bg-primary-foreground text-primary-text border border-primary-border overflow-hidden absolute top-0 right-[0%] z-50 w-[200px] h-fit rounded-[20px] py-[10px]'>
                        { loggedInUser.username === post.author.username 
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
                            </> )
                            : (
                                <>
                                    <button 
                                        onClick={handleFollowUser}
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                        ref={followBtn}>
                                            {isFollowedByTheUser ? `Unfollow ${post.author.username}` : `Follow ${post.author.username}`}
                                    </button>

                                    <button
                                        onClick={handleBlockUser}
                                        className='w-full flex items-center gap-2 text-left font-bold px-[20px] py-[7px] hover:bg-card-hover'
                                        ref={blockBtn}>
                                        {isBlockedByTheUser ? `Unblock ${post.author.username}` : `Block ${post.author.username}`}
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
