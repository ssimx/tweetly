import { BasicPostType, VisitedPostType } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import UserHoverCard from '../UserHoverCard'
import PostText from './PostText'
import PostImages from './PostImages'
import PostBtns from './PostBtns'
import PostMenu from './PostMenu'
import PostReplies from './post-replies/PostReplies'
import NewPost from '../feed/NewPost'

type VisitedPostTemplateType = {
    post: VisitedPostType,
    postRef: React.RefObject<HTMLDivElement | null>,
    scrollRef?: React.RefObject<HTMLDivElement | null>
    postTime: string,
    postDate: string,
    replies: BasicPostType[],
    setReplies: React.Dispatch<React.SetStateAction<BasicPostType[]>>
    repliesCursor: number | null,
    setRepliesCursor: React.Dispatch<React.SetStateAction<number | null>>
    repliesEndReached: boolean,
    setRepliesEndReached: React.Dispatch<React.SetStateAction<boolean>>
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    isFollowingTheUser: boolean,
    setIsFollowingTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    followingCount: number,
    setFollowingCount: React.Dispatch<React.SetStateAction<number>>,
    followersCount: number,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
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
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    isFollowingTheUser,
    setIsFollowingTheUser,
    followingCount,
    setFollowingCount,
    followersCount,
    setFollowersCount,
    openPhoto,
    type = 'normal'
}: VisitedPostTemplateType) {

    return (
        <>
            <div className='post' ref={postRef}>
                <div className='w-full flex gap-2 items-center'>
                    <Link href={`/${post.author.username}`} className='group'>
                        <Image
                            src={post.author.profile.profilePicture}
                            alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <div className=''>
                        <UserHoverCard
                            user={post.author}
                            _followingCount={followingCount}
                            _followersCount={followersCount}
                            _setFollowersCount={setFollowersCount}
                            isFollowedByTheUser={isFollowedByTheUser}
                            setIsFollowedByTheUser={setIsFollowedByTheUser}
                            isFollowingTheUser={isFollowingTheUser} />
                        <p>@{post.author.username}</p>
                    </div>
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

                <div className='post-content flex-col'>
                    <PostText content={post.content} />
                    {type === 'normal' && <PostImages images={post.images} authorUsername={post.author.username} postId={post.id} openPhoto={openPhoto} />}
                </div>
                <div className='post-footer'>
                    <p>{postTime}</p>
                    <p className='px-1'>·</p>
                    <p>{postDate}</p>
                </div>
                <div className='post-btns'>
                    <PostBtns post={post} />
                </div>
            </div>
            <div className='reply'>
                <NewPost placeholder='Post your reply' reply={post.id} />
            </div>
            <PostReplies
                parentPostId={post.id}
                replies={replies}
                setReplies={setReplies}
                repliesCursor={repliesCursor}
                setRepliesCursor={setRepliesCursor}
                repliesEndReached={repliesEndReached}
                setRepliesEndReached={setRepliesEndReached}
                scrollElementRef={scrollRef} />
        </>
    )
}
