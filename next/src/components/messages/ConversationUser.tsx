import { ReceiverType } from '@/app/(root)/messages/[conversationId]/page';
import Image from 'next/image';

export default function ConversationUser({ user }: { user: ReceiverType }) {
    const createdAt = new Date(user.createdAt);
    const joined = `${createdAt.toLocaleDateString('default', { month: 'long' })} ${createdAt.getFullYear()}`;

    return (
        <div className='flex-center p-8'>
            <div className='flex flex-col items-center'>
                <div className='flex flex-col items-center leading-5'>
                    <Image
                        src={user.profile.profilePicture || 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png'}
                        height={60} width={60}
                        alt='User profile picture'
                        className='h-[60px] w-[60px] rounded-full' />
                    <p className='font-bold'>{user.profile.name}</p>
                    <p className='font-light'>@{user.username}</p>
                </div>

                <div className='flex items-center gap-2 mt-3'>
                    <p className='text-secondary-text text-14'>
                        Joined {joined}
                    </p>
                    <p>·</p>
                    <p className='text-secondary-text text-14'>
                        {user['_count'].followers} {user['_count'].followers > 1 ? 'Followers' : 'Follower'}
                    </p>
                </div>
            </div>
        </div>
    )
}
