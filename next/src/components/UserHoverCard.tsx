'use client';
import { useUserContext } from '@/context/UserContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useRouter } from 'next/navigation';

interface AuthorType {
    username: string,
    name: string,
    profilePicture: string,
    bio: string,
    following: number,
};

interface UserHoverCardType {
    author: AuthorType,
    followersCount: number,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    isFollowingTheUser: boolean,
};

export default function UserHoverCard({
    author,
    followersCount,
    setFollowersCount,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    isFollowingTheUser,
}: UserHoverCardType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const followBtn = useRef<HTMLButtonElement>(null);
    const { loggedInUser } = useUserContext();
    const { suggestions, updateFollowState } = useFollowSuggestionContext();
    const [isFollowing, setIsFollowing] = useState(isFollowedByTheUser);
    const userIsAuthor = author.username === loggedInUser.username;
    const router = useRouter();

    useEffect(() => {
        if (suggestions?.some((user) => user.username === author.username)) {
            const following = suggestions.find((user) => user.username === author.username)?.isFollowing as boolean;
            setIsFollowing(following);
        }
    }, [author, suggestions]);

    const handleFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        followBtn.current && followBtn.current.setAttribute('disabled', "");

        try {
            if (isFollowing) {
                const unfollow = await fetch(`/api/users/removeFollow/${author.username}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!unfollow) throw new Error("Couldn't unfollow the user");

                setIsFollowedByTheUser(false);
                setFollowersCount((current) => current - 1);
                updateFollowState(author.username, false);
                return;
            } else {
                const follow = await fetch(`/api/users/follow/${author.username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!follow) throw new Error("Couldn't follow the user");

                setIsFollowedByTheUser(true);
                setFollowersCount((current) => current + 1);
                updateFollowState(author.username, true);
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            followBtn.current && followBtn.current.removeAttribute('disabled');
            setIsSubmitting(false);
        }
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    return (
        <div onClick={() => router.push(`/${author.username}`)} role='link'>
            <HoverCard>
                <HoverCardTrigger href={`/${author.username}`} className='text-primary-text w-fit whitespace-nowrap overflow-hidden font-bold hover:underline' onClick={(e) => handleLinkClick(e)}>{author.name}</HoverCardTrigger>
                <HoverCardContent>
                    <div className='user-hover-card-info'>
                        <div className='user-hover-card-header'>
                            <Link href={`/${author.username}`} className='group w-fit' onClick={(e) => handleLinkClick(e)}>
                                <Image
                                    src={author.profilePicture}
                                    alt='User profile picture'
                                    width={60} height={60}
                                    className='w-[60px] h-[60px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                            </Link>
                            <div>
                                {
                                    !userIsAuthor ?
                                        isFollowing
                                            ? (
                                                <button
                                                    className="follow-btn following before:content-['Following'] hover:before:content-['Unfollow']"
                                                    onClick={(e) => handleFollow(e)} ref={followBtn} >
                                                </button>
                                            )
                                            : <button className='follow-btn' onClick={handleFollow} ref={followBtn}>
                                                Follow
                                            </button>
                                        : null
                                }
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <Link href={`/${author.username}`} className='font-bold w-fit text-18 hover:underline' onClick={(e) => handleLinkClick(e)}>{author.name}</Link>
                            <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                                <p className='text-secondary-text'>@{author.username}</p>
                                {loggedInUser.username !== author.username && isFollowingTheUser && (
                                    <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className='break-all'>{author.bio}</p>
                        </div>
                        <div className='flex gap-4'>
                            <Link href={`/${author.username}/following`} className='hover:underline' onClick={(e) => handleLinkClick(e)}>
                                <p className='font-bold'>{`${author.following}`} <span className='text-secondary-text font-normal'>Following</span></p>
                            </Link>
                            <Link href={`/${author.username}/followers`} className='hover:underline' onClick={(e) => handleLinkClick(e)}>
                                <p className='font-bold'>{`${followersCount}`} <span className='text-secondary-text font-normal'>Followers</span></p>
                            </Link>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    )
}
