'use client';
import { PostInfoType } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from './PostBtns';
import { useRouter } from 'next/navigation';


export default function PostReplies({ replies }: { replies: PostInfoType[] }) {
    const router = useRouter();

    const handleCardClick = (reply: PostInfoType) => {
        router.push(`/${reply.author.username}/status/${reply.id}`);
    };

    return (
        <div>
            { replies.map((reply) => (
                <div key={reply.id}>
                    <div onClick={() => handleCardClick(reply)} className='post hover:bg-card-hover hover:cursor-pointer'>
                        <div className='post-header'>
                            <Link href={`/${reply.author.username}`} className='group'>
                                <Image
                                    src={`http://localhost:3001/public/profilePictures/${reply.author.profile?.profilePicture}`}
                                    alt='Post author profile pic' width={35} height={35} className='rounded-full h-fit group-hover:outline group-hover:outline-primary/10' />
                            </Link>
                            <div className='flex gap-2 text-dark-500'>
                                <Link href={`/${reply.author.username}`} className='text-black-1 font-bold hover:underline'>{reply.author.profile?.name}</Link>
                                <p>@{reply.author.username}</p>
                                <p>·</p>
                                <p>{formatPostDate(reply.createdAt)}</p>
                            </div>
                        </div>
                        <div className='post-content'>
                            <p>{reply.content}</p>
                        </div>
                        <div className='!border-t-0 post-btns'>
                            <PostBtns post={reply} />
                        </div>
                    </div>

                    <hr className='feed-hr-line' />
                </div>
            ))}
        </div>
    )
}
