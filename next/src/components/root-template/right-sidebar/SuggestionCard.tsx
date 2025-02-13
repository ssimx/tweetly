'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/UserHoverCard';
import FollowBtn from '@/components/FollowBtn';
import { FollowSuggestionType, UserInfoType } from '@/lib/types';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';

export default function SuggestionCard({ user }: { user: FollowSuggestionType }) {
    const { blockedUsers } = useBlockedUsersContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // if user is in suggestions, track it's isFollowed property instead
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(user.isFollowed);
    // Is user following the logged in user
    const [isFollowingTheUser, setIsFollowingTheUser] = useState<boolean>(user.following.length === 1);

    // Post author following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [followingCount, setFollowingCount] = useState(user._count.following);
    const [followersCount, setFollowersCount] = useState(user._count.followers);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isFollowed, ...hoverCardUser } = user;

    useEffect(() => {
        setIsFollowedByTheUser(user.isFollowed);
        setFollowingCount(user._count.following);
        setFollowersCount(user._count.followers);
    }, [user]);

    useEffect(() => {
        if (blockedUsers?.some((blockedUser) => blockedUser === user.username)) {
            setIsFollowingTheUser(false);
        }
    }, [blockedUsers, user.username]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleCardClick = () => {
        router.push(`/${user.username}`);
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    if (blockedUsers.some((username) => username === user.username)) return <></>;
    
    return (
        <div onClick={handleCardClick} className='profile-follower-followee-card'>
            <Image
                src={user.profile.profilePicture || 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png'}
                height={40} width={40}
                alt='Follower profile pic'
                className='rounded-full min-w-[40px]' />

            <div className='flex flex-col leading-5'>
                <div className='flex gap-x-2 flex-wrap items-center text-secondary-text whitespace-nowrap overflow-hidden'>
                    <UserHoverCard
                        user={hoverCardUser as UserInfoType}
                        _followingCount={followingCount}
                        _followersCount={followersCount}
                        _setFollowersCount={setFollowersCount}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        isFollowingTheUser={isFollowingTheUser} />

                    <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                        <p className='text-16'>@{user.username}</p>
                        {isFollowingTheUser && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>
            </div>

            <div className='ml-auto [&_button]:py-1'>
                <FollowBtn
                    username={user.username}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser}
                    setFollowersCount={setFollowersCount}
                />
            </div>
        </div>
    )
}
