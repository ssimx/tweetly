'use client';
import { useUserContext } from '@/context/UserContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { useRouter } from 'next/navigation';
import FollowBtn from './FollowBtn';
import { UserInfoType } from '@/lib/types';

interface UserHoverCardType {
    user: UserInfoType,
    _followingCount: number,
    _followersCount: number,
    _setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    isFollowingTheUser: boolean,
};

export default function UserHoverCard({
    user,
    _followingCount,
    _followersCount,
    _setFollowersCount,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    isFollowingTheUser,
}: UserHoverCardType) {
    const { loggedInUser, followersCount, followingCount } = useUserContext();
    const router = useRouter();
    const userIsLoggedInUser = user.username === loggedInUser.username;

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    return (
        <div onClick={() => router.push(`/${user.username}`)} role='link'>
            <HoverCard>
                <HoverCardTrigger asChild onClick={(e) => handleLinkClick(e)}>
                    <Link href={`/${user.username}`} className='text-primary-text w-fit whitespace-nowrap overflow-hidden font-bold hover:underline'>
                        {user.profile.name}
                    </Link>
                </HoverCardTrigger>
                <HoverCardContent>
                    <div className='user-hover-card-info'>
                        <div className='user-hover-card-header'>
                            <Link href={`/${user.username}`} className='group w-fit' onClick={(e) => handleLinkClick(e)}>
                                <Image
                                    src={user.profile.profilePicture}
                                    alt='User profile picture'
                                    width={60} height={60}
                                    className='w-[60px] h-[60px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                            </Link>
                            <div>
                                {!userIsLoggedInUser && (
                                    <FollowBtn
                                        username={user.username}
                                        isFollowedByTheUser={isFollowedByTheUser}
                                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                                        setFollowersCount={_setFollowersCount}
                                    />
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <Link href={`/${user.username}`} className='font-bold w-fit text-18 hover:underline' onClick={(e) => handleLinkClick(e)}>{user.profile.name}</Link>
                            <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                                <p className='text-secondary-text'>@{user.username}</p>
                                {loggedInUser.username !== user.username && isFollowingTheUser && (
                                    <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className='break-all'>{user.profile.bio}</p>
                        </div>
                        <div className='flex gap-4'>
                            <Link href={`/${user.username}/following`} className='hover:underline' onClick={(e) => handleLinkClick(e)}>
                                <p className='font-bold'>
                                    {`${userIsLoggedInUser
                                        ? followingCount
                                        : _followingCount
                                    }`}
                                <span className='text-secondary-text font-normal'> Following</span></p>
                            </Link>
                            <Link href={`/${user.username}/followers`} className='hover:underline' onClick={(e) => handleLinkClick(e)}>
                                <p className='font-bold'>
                                    {`${userIsLoggedInUser
                                        ? followersCount
                                        : _followersCount
                                    }`}
                                <span className='text-secondary-text font-normal'> Followers</span></p>
                            </Link>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    )
}
