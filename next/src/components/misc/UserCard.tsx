'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/misc/UserHoverCard';
import FollowBtn from '@/components/misc/FollowBtn';
import { UserInfoType } from '@/lib/types';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { useUserContext } from '@/context/UserContextProvider';

export default function UserCard({ user }: { user: UserInfoType }) {
    const { blockedUsers } = useBlockedUsersContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // if user is in suggestions, track it's isFollowed property instead
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(user.followers.length === 1);
    // Is user following the logged in user
    const [isFollowingTheUser, setIsFollowingTheUser] = useState<boolean>(user.following.length === 1);

    // Post author following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [followingCount, ] = useState(user._count.following);
    const [followersCount, setFollowersCount] = useState(user._count.followers);

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
            <div>
                <Image
                    src={user.profile.profilePicture || 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png'}
                    height={40} width={40}
                    alt='Follower profile pic'
                    className='rounded-full min-w-[40px]' />
            </div>

            <div className='flex flex-col leading-5'>
                <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                    <UserHoverCard
                        user={user}
                        _followingCount={followingCount}
                        _followersCount={followersCount}
                        _setFollowersCount={setFollowersCount}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        isFollowingTheUser={isFollowingTheUser} />

                    <div className='flex-center gap-2'>
                        <p className='text-16'>@{user.username}</p>
                        {isFollowingTheUser && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>

                <div className='profile-card-bio-overflow' >
                    <p className='bio-content'>{user.profile.bio}</p>
                </div>
            </div>

            {loggedInUser.username !== user.username && (
                <div className='ml-auto [&_button]:py-1'>
                    <FollowBtn
                        username={user.username}
                        setFollowersCount={setFollowersCount}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser} />
                </div>
            )}
        </div>
    )
}
