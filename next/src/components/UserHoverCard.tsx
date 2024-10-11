'use client';
import { useUserContext } from '@/context/UserContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

interface AuthorType {
    username: string,
    name: string,
    profilePicture: string,
    bio: string,
    following: number,
};

interface UserHoverCardType {
    author: AuthorType,
    followers: number,
    setFollowers: React.Dispatch<React.SetStateAction<number>>,
    isFollowing: boolean,
    setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>,
};

export default function UserHoverCard({
    author,
    followers,
    setFollowers,
    isFollowing,
    setIsFollowing
}: UserHoverCardType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const followBtn = useRef<HTMLButtonElement>(null);
    const { user } = useUserContext();
    const userIsAuthor = author.username === user.username;

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

                setIsFollowing(false);
                setFollowers((current) => current - 1);
                return;
            } else {
                const follow = await fetch(`/api/users/follow/${author.username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!follow) throw new Error("Couldn't follow the user");

                setIsFollowing(true);
                setFollowers((current) => current + 1);
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
        <div className='user-hover-card-info '>
            <div className='user-hover-card-header'>
                <Link href={`/${author.username}`} className='group w-fit' onClick={(e) => handleLinkClick(e)}>
                    <Image
                        src={author.profilePicture}
                        alt='User profile picture'
                        width={60} height={60}
                        className='rounded-full group-hover:outline group-hover:outline-primary/10' />
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
                <Link href={`/${author.username}`} className='font-bold text-18 hover:underline' onClick={(e) => handleLinkClick(e)}>{author.name}</Link>
                <p className='text-dark-500'>@{author.username}</p>
            </div>

            <div>
                <p className='break-all'>{author.bio}</p>
            </div>

            <div className='flex gap-4'>
                <div className='flex gap-1'>
                    <p className='font-bold'>{author.following}</p>
                    <p className='text-dark-500'>Following</p>
                </div>

                <div className='flex gap-1'>
                    <p className='font-bold'>{followers}</p>
                    <p className='text-dark-500'>Followers</p>
                </div>
            </div>
        </div>
    )
}
