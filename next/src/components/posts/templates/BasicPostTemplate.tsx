'use client';
import PostMenuButton from '../post-parts/PostMenuButton';
import PostText from '../post-parts/PostText';
import PostImages from '../post-parts/PostImages';
import PostButtons from '../post-parts/PostButtons';
import UserHoverCard from '@/components/misc/UserHoverCard';
import PostAuthorImage from '../post-parts/PostAuthorImage';
import PostDate from '../post-parts/PostDate';
import { UserActionType } from '@/lib/userReducer';
import { BasePostDataType, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';

type BasicPostTemplateType = {
    post: BasePostDataType,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
    openPhoto: (photoIndex: number, authorUsername: string, postId: number) => void
    type?: 'normal' | 'parent',
    searchSegments?: string[],
    children?: React.ReactNode;
};

export default function BasicPostTemplate({
    post,
    userState,
    dispatch,
    openPhoto,
    type = 'normal',
    searchSegments,
    children,
}: BasicPostTemplateType) {

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
                <div className='w-full min-w-[0px] grid grid-cols-[auto_auto_auto_auto_1fr] grid-rows-1 gap-2 text-secondary-text'>
                    <div className="overflow-hidden min-w-0">
                        <UserHoverCard
                            user={post.author}
                            userState={userState}
                            dispatch={dispatch}
                        />
                    </div>
                    <p className='overflow-hidden'>@{post.author.username}</p>
                    <p className='w-fit'>·</p>
                    <PostDate createdAt={post.createdAt} />
                    <PostMenuButton
                        post={post}
                        userState={userState}
                        dispatch={dispatch}
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
                {children}

                <div className='!border-t-0 py-1'>
                    <PostButtons
                        post={post}
                    />
                </div>
            </div>
        </div>
    )
}
