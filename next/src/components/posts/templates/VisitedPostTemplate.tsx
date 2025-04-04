import UserHoverCard from '@/components/misc/UserHoverCard';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import PostMenuButton from '../post-parts/PostMenuButton';
import PostText from '../post-parts/PostText';
import PostImages from '../post-parts/PostImages';
import PostButtons from '../post-parts/PostButtons';
import NewPost from '@/components/feed/NewPost';
import PostReplies from '../post-replies/PostReplies';
import { BasePostDataType, UserAndViewerRelationshipType, UserStatsType } from 'tweetly-shared';
import { UserActionType } from '@/lib/userReducer';
import { usePostInteraction } from '@/context/PostInteractionContextProvider';

type VisitedPostTemplateType = {
    // POST INFO
    post: BasePostDataType,
    postRef: React.RefObject<HTMLDivElement | null>,
    scrollRef?: React.RefObject<HTMLDivElement | null>
    postTime: string,
    postDate: string,

    replies: BasePostDataType[],
    setReplies: React.Dispatch<React.SetStateAction<BasePostDataType[]>>
    repliesCursor: number | null,
    setRepliesCursor: React.Dispatch<React.SetStateAction<number | null>>
    repliesEndReached: boolean,
    setRepliesEndReached: React.Dispatch<React.SetStateAction<boolean>>

    // USER RELATIONSHIP
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,

    openPhoto: (photoIndex: number, authorUsername: string, postId: number) => void
    type?: 'normal' | 'overlay',
}

export default function VisitedPostTemplate({
    post,
    postRef,
    scrollRef,
    postTime,
    postDate,
    replies,
    setReplies,
    repliesCursor,
    setRepliesCursor,
    repliesEndReached,
    setRepliesEndReached,
    userState,
    dispatch,
    openPhoto,
    type = 'normal'
}: VisitedPostTemplateType) {
    const { interaction } = usePostInteraction(post);

    if (post.isDeleted || interaction.deleted) {
        return (
            <div className='w-full mt-2 flex flex-col gap-2'>
                <div className='w-[95%] mx-auto p-4 flex flex-col min-w-0 rounded-md bg-secondary-foreground'>
                    {interaction.deleted
                        ? 'You have removed this Post.'
                        : 'This Post was deleted by the Post author.'
                    }
                </div>
                <div className='feed-hr-line'></div>
                <NewPost placeholder='Post your reply' reply={post.id} />
                <PostReplies
                    parentPostId={post.id}
                    replies={replies}
                    setReplies={setReplies}
                    repliesCursor={repliesCursor}
                    setRepliesCursor={setRepliesCursor}
                    repliesEndReached={repliesEndReached}
                    setRepliesEndReached={setRepliesEndReached}
                    scrollElementRef={scrollRef}
                />
            </div>
        )
    }

    return (
        <>
            <div className='w-full px-4 flex flex-col gap-2 border-b' ref={postRef}>
                <div className='w-full flex gap-2 items-center'>
                    <Link href={`/${post.author.username}`} className='group'>
                        <Image
                            src={post.author.profile.profilePicture}
                            alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <div className=''>
                        <UserHoverCard
                            user={post.author}
                            userState={userState}
                            dispatch={dispatch}
                        />
                        <p className='text-secondary-text'>@{post.author.username}</p>
                    </div>
                    <PostMenuButton
                        post={post}
                        userState={userState}
                        dispatch={dispatch}
                    />
                </div>

                <div className='w-full min-w-[1%] flex break-words whitespace-normal flex-col'>
                    <PostText content={post.content} />
                    {type === 'normal' && <PostImages images={post.images} authorUsername={post.author.username} postId={post.id} openPhoto={openPhoto} />}
                </div>
                <div className='flex mb-2 text-secondary-text'>
                    <p>{postTime}</p>
                    <p className='px-1'>·</p>
                    <p>{postDate}</p>
                </div>
                <div className='py-1 border-t'>
                    <PostButtons post={post} />
                </div>
            </div>
            <NewPost placeholder='Post your reply' reply={post.id} />
            <PostReplies
                parentPostId={post.id}
                replies={replies}
                setReplies={setReplies}
                repliesCursor={repliesCursor}
                setRepliesCursor={setRepliesCursor}
                repliesEndReached={repliesEndReached}
                setRepliesEndReached={setRepliesEndReached}
                scrollElementRef={scrollRef}
            />
        </>
    )
}
