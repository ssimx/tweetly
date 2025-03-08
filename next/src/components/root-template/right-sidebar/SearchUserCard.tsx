'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserDataType } from 'tweetly-shared';

export default function SearchUserCard({ user }: { user: UserDataType }) {
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
                    <p className='text-16 text-secondary-text font-light'>@{user.username}</p>
            </div>
        </div>
    )
}
