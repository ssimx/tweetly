'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUserContext } from '@/context/UserContextProvider';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/UserHoverCard';
import { UserSuggestion } from '@/context/SuggestionContextProvider';
import FollowBtn from '@/components/FollowBtn';

interface SearchUserType {
    username: string;
    profile: {
        name: string;
        profilePicture: string;
    };
}

export default function SearchUserCard({ user }: { user: SearchUserType }) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${user.username}`);
    };

    return (
        <div onClick={handleCardClick} className='profile-follower-followee-card'>
            <div>
                <Image
                    src={user.profile.profilePicture}
                    height={40} width={40}
                    alt='Follower profile pic'
                    className='rounded-full min-w-[40px]' />
            </div>

            <div className='flex flex-col leading-5'>
                    <p className='text-16 font-bold'>{user.profile.name}</p>
                    <p className='text-16 text-gray-600 font-light'>@{user.username}</p>
            </div>
        </div>
    )
}
