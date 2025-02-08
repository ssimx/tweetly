'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUserContext } from '@/context/UserContextProvider';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/UserHoverCard';
import FollowBtn from '@/components/FollowBtn';
import { FollowSuggestionType } from '@/lib/types';

export default function SuggestionCard({ user }: { user: FollowSuggestionType }) {
    // state for updating followers count when logged in user follows / blocks the profile
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(false);
    const [followersCount, setFollowersCount] = useState(user['_count'].followers);

    // state to show whether the profile follows logged in user
    //      and to update the count when logged in user blocks the profile
    const [isFollowingTheUser, setIsFollowingTheUser] = useState(user.following.length === 1);
    const [followingCount, setFollowingCount] = useState(user['_count'].following);

    const { loggedInUser } = useUserContext();
    const router = useRouter();

    useEffect(() => {
        setIsFollowedByTheUser(user.isFollowing);
    }, [user]);

    const handleCardClick = () => {
        router.push(`/${user.username}`);
    };

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
                        author={{
                            username: user.username,
                            name: user.profile.name,
                            profilePicture: user.profile.profilePicture,
                            bio: user.profile.bio,
                            following: followingCount
                        }}
                        followersCount={followersCount}
                        setFollowersCount={setFollowersCount}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        isFollowingTheUser={isFollowingTheUser}
                    />

                    <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                        <p className='text-16'>@{user.username}</p>
                        {loggedInUser.username !== user.username && isFollowingTheUser && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>
            </div>

            <div className='ml-auto [&_button]:py-1'>
                <FollowBtn key={user.username}
                    username={user.username}
                    setFollowersCount={setFollowersCount}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser} />
            </div>
        </div>
    )
}
