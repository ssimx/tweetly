'use client';
import { BasicPostType } from '@/lib/types';
import PostBtns from './PostBtns';
import UserHoverCard from '../UserHoverCard';
import PostText from './PostText';
import PostImages from './PostImages';
import PostMenu from './PostMenu';
import PostAuthorImage from './PostAuthorImage';
import PostDate from './PostDate';

type BasicPostTemplateType = {
    post: BasicPostType,
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    isFollowingTheUser: boolean,
    setIsFollowingTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    followingCount: number,
    setFollowingCount: React.Dispatch<React.SetStateAction<number>>,
    followersCount: number,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    openPhoto: (photoIndex: number, authorUsername: string, postId: number) => void
    type?: 'normal' | 'parent',
    searchSegments?: string[],
    children?: React.ReactNode;
};

export default function BasicPostTemplate({
    post,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    isFollowingTheUser,
    setIsFollowingTheUser,
    followingCount,
    setFollowingCount,
    followersCount,
    setFollowersCount,
    openPhoto,
    type = 'normal',
    searchSegments,
    children,
}: BasicPostTemplateType) {
    console.log(children)

    return (
        <div className='w-full grid grid-cols-[auto,1fr] grid-rows-1 gap-2'>

            {type === 'normal' && (
                <div className='w-auto h-full'>
                    <PostAuthorImage author={post.author} />
                </div>
            )}

            {type === 'parent' && (
                <div className='w-auto flex flex-col items-center gap-1 min-w-[40px] min-h-full'>
                    <PostAuthorImage author={post.author} />
                    <div className='border-x h-full origin-top'></div>
                </div>
            )}

            <div className='w-full flex flex-col min-w-0'>
                <div className='flex gap-2 text-secondary-text'>
                    <UserHoverCard
                        user={post.author}
                        _followingCount={followingCount}
                        _followersCount={followersCount}
                        _setFollowersCount={setFollowersCount}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        isFollowingTheUser={isFollowingTheUser} />
                    <p>@{post.author.username}</p>
                    <p>·</p>
                    <PostDate createdAt={post.createdAt} />
                    <PostMenu
                        post={post}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        isFollowingTheUser={isFollowingTheUser}
                        setIsFollowingTheUser={setIsFollowingTheUser}
                        _setFollowersCount={setFollowersCount}
                        _setFollowingCount={setFollowingCount}
                    />
                </div>

                <div className='w-full h-fit min-w-[1%] break-words whitespace-normal flex flex-col'>
                    <PostText content={post.content} searchSegments={searchSegments} />
                    <PostImages
                        images={post.images}
                        authorUsername={post.author.username}
                        postId={post.id}
                        openPhoto={openPhoto} />
                </div>

                {/* In case post has an inner post/parent (notification reply) */}
                { children }

                <div className='!border-t-0 py-1'>
                    <PostBtns post={post} />
                </div>
            </div>
        </div>
    )
}
