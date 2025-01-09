'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useUserContext } from '@/context/UserContextProvider';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/UserHoverCard';
import { UserSuggestion } from '@/context/SuggestionContextProvider';
import FollowBtn from '@/components/FollowBtn';

export default function DialogSuggestionCard({ user }: { user: UserSuggestion }) {
    // state for updating followers count when logged in user follows / blocks the profile
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(user.isFollowing);
    const [followersCount, setFollowersCount] = useState(user['_count'].followers);

    // state to show whether the profile follows logged in user
    //      and to update the count when logged in user blocks the profile
    const [isFollowingTheUser, setIsFollowingTheUser] = useState(user.following.length === 1);
    const [followingCount, setFollowingCount] = useState(user['_count'].following);

    const { loggedInUser } = useUserContext();
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${user.username}`);
    };

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

                    <div className='flex-center gap-2'>
                        <p className='text-16'>@{user.username}</p>
                        {loggedInUser.username !== user.username && isFollowingTheUser && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>

                <div className='profile-card-bio-overflow' >
                    <p className='bio-content'>{user.profile.bio}</p>
                </div>
            </div>

            <div className='ml-auto [&_button]:py-1'>
                <FollowBtn
                    username={user.username}
                    setFollowersCount={setFollowersCount}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser} />
            </div>
        </div>
    )
}
