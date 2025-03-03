'use client';
import { useUserContext } from '@/context/UserContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FollowButton from './FollowButton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { UserAndViewerRelationshipType, UserDataType, UserStatsType } from 'tweetly-shared';
import { UserActionType } from '@/lib/userReducer';

interface UserHoverCardType {
    user: UserDataType,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function UserHoverCard({
    user,
    userState,
    dispatch,
}: UserHoverCardType) {
    const router = useRouter();
    const { loggedInUser, followersCount, followingCount } = useUserContext();
    const userIsLoggedInUser = user.username === loggedInUser.username;

    const {
        isFollowingViewer,
    } = userState.relationship;

    const {
        followersCount: _followersCount,
        followingCount: _followingCount,
    } = userState.stats;

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
                    <div className='w-full flex flex-col gap-2 text-primary-text'>
                        <div className='flex justify-between truncate'>
                            <Link href={`/${user.username}`} className='group w-fit' onClick={(e) => handleLinkClick(e)}>
                                <Image
                                    src={user.profile.profilePicture}
                                    alt='User profile picture'
                                    width={60} height={60}
                                    className='w-[60px] h-[60px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                            </Link>
                            <div>
                                {!userIsLoggedInUser && (
                                    <FollowButton
                                        user={user.username}
                                        userState={userState}
                                        dispatch={dispatch}
                                    />
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <Link href={`/${user.username}`} className='font-bold w-fit text-18 hover:underline' onClick={(e) => handleLinkClick(e)}>{user.profile.name}</Link>
                            <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                                <p className='text-secondary-text'>@{user.username}</p>
                                {loggedInUser.username !== user.username && isFollowingViewer && (
                                    <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                                )}
                            </div>
                        </div>
                        <p className='w-full break-words whitespace-normal bio-content'>
                            {user.profile.bio}
                        </p>
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
