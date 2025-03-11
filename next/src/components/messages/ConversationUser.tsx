import Image from 'next/image';
import { ConversationType } from 'tweetly-shared';

export default function ConversationUser({ user }: { user: Pick<ConversationType, 'participants'>['participants'][0] }) {
    const createdAt = new Date(user.createdAt);
    const joined = `${createdAt.toLocaleDateString('default', { month: 'long' })} ${createdAt.getFullYear()}`;

    return (
        <div className='flex-center p-8'>
            <div className='flex flex-col items-center'>
                <div className='flex flex-col items-center leading-5'>
                    <Image
                        src={user.profile.profilePicture}
                        height={60} width={60}
                        alt='User profile picture'
                        className='h-[60px] w-[60px] rounded-full' />
                    <p className='mt-2 font-bold'>{user.profile.name}</p>
                    <p className='font-light'>@{user.username}</p>
                </div>

                <div className='flex items-center gap-2 mt-3'>
                    <p className='text-secondary-text text-14'>
                        Joined {joined}
                    </p>
                    <p>·</p>
                    <p className='text-secondary-text text-14'>
                        {user.stats.followersCount} {user.stats.followersCount > 1 ? 'Followers' : 'Follower'}
                    </p>
                </div>
            </div>
        </div>
    )
}
