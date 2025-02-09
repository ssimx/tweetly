'use client';
import { BasicPostType, VisitedPostType } from '@/lib/types';
import Image from 'next/image';
import PostBtns from './PostBtns';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useEffect, useRef, useState } from 'react';
import PostText from './PostText';
import PostImages from './PostImages';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import NewPost from '../feed/NewPost';
import PostReplies from './post-replies/PostReplies';
import ParentPostInfo from './ParentPostInfo';

export default function PostInfo({ post, parentPost, photoId }: { post: VisitedPostType, parentPost?: BasicPostType, photoId?: number }) {
    // post info
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author.followers.length);
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);
    const postRef = useRef<HTMLDivElement>(null);
    const postDate = new Date(post.createdAt);
    const postTime = `${postDate.getHours()}:${postDate.getMinutes()}`;
    const postFormatDate = `${postDate.toLocaleString('default', { month: 'short' })} ${postDate.getDate()}, ${postDate.getFullYear()}`;

    // replies
    const [replies, setReplies] = useState<BasicPostType[]>(post.replies);
    const [repliesCursor, setRepliesCursor] = useState<number | null>(post.replies.length > 0 ? post.replies.slice(-1)[0].id : null);
    const [repliesEndReached, setRepliesEndReached] = useState<boolean>(post.repliesEnd);

    // image overlay state
    const postInfoRef = useRef<HTMLDivElement>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [overlayCurrentImageIndex, setOverlayCurrentImageIndex] = useState<number | null>(null);
    const [isPostInfoVisible, setIsPostInfoVisible] = useState(true);

    const openPhoto = (photoIndex: number, authorUsername: string, postId: number) => {
        window.history.replaceState(null, '', `/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`);
        setIsOverlayVisible(true);
        setOverlayCurrentImageIndex(photoIndex);
        document.body.style.overflow = 'hidden';
    };

    const closePhoto = () => {
        window.history.replaceState(null, '', `/${post.author.username}/status/${post.id}`);
        setIsOverlayVisible(false);
        setOverlayCurrentImageIndex(null);
        document.body.style.overflow = '';
    };

    useEffect(() => {
        parentPost && postRef.current && window.scrollTo(0, postRef.current.offsetTop);

        if (photoId) {
            if (!post.images?.length || photoId < 1 || photoId > post.images.length) {
                // If invalid, remove the param and prevent loop
                window.history.replaceState(null, '', `/${post.author.username}/status/${post.id}`);
            } else {
                // If valid, render only overlay if image was clicked from the feed, otherwise render both post and overlay
                document.body.style.overflow = "hidden";
                setIsOverlayVisible(true);
                setOverlayCurrentImageIndex(photoId - 1);
            }
        }

        return (() => {
            document.body.style.overflow = '';
        });
    }, [post, photoId, parentPost]);

    return (
        <>
            <div className='flex flex-col'>
                {parentPost && (
                    <ParentPostInfo post={parentPost} />
                )}

                <div className='post' ref={postRef}>
                    <div className='post-header'>
                        <Link href={`/${post.author.username}`} className='group'>
                            <Image
                                src={post.author.profile.profilePicture}
                                alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                        </Link>
                        <div className=''>
                            <UserHoverCard
                                author={{
                                    username: post.author.username,
                                    name: post.author.profile.name,
                                    profilePicture: post.author.profile.profilePicture,
                                    bio: post.author.profile.bio,
                                    following: post.author['_count'].following,
                                }}
                                followersCount={followersCount}
                                setFollowersCount={setFollowersCount}
                                isFollowedByTheUser={isFollowedByTheUser}
                                setIsFollowedByTheUser={setIsFollowedByTheUser}
                                isFollowingTheUser={isFollowingTheUser} />
                            <p>@{post.author.username}</p>
                        </div>
                    </div>
                    <div className='post-content flex-col'>
                        <PostText content={post.content} />
                        <PostImages
                            images={post.images}
                            authorUsername={post.author.username}
                            postId={post.id}
                            openPhoto={openPhoto} />
                    </div>
                    <div className='post-footer'>
                        <p>{postTime}</p>
                        <p className='px-1'>·</p>
                        <p>{postFormatDate}</p>
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
                    setRepliesEndReached={setRepliesEndReached} />
            </div>

            {(isOverlayVisible && overlayCurrentImageIndex !== null) &&
                createPortal(
                    <div className={`fixed inset-0 z-50 bg-black-1/50 grid ${!isPostInfoVisible ? 'grid-cols-[100%]' : 'grid-cols-[80%,20%]'}`} >
                        <div className='relative h-[100vh] flex-center' onClick={closePhoto}>
                            <button className='absolute z-[100] inset-0 m-3 p-2 h-fit w-fit rounded-full bg-gray-800 hover:bg-gray-700 hover:cursor-pointer'
                                onClick={closePhoto}>
                                <X size={24} className='color-white-1 ' />
                            </button>
                            <button className='absolute z-[100] right-0 top-0 m-3 p-2 h-fit w-fit rounded-full bg-gray-800 hover:bg-gray-700 hover:cursor-pointer'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPostInfoVisible((current) => !current);
                                }}>
                                {isPostInfoVisible
                                    ? <ChevronsRight size={24} className='color-white-1 ' />
                                    : <ChevronsLeft size={24} className='color-white-1 ' />
                                }
                            </button>
                            {overlayCurrentImageIndex !== 0 && (
                                <button className='absolute z-[100] left-0 m-3 p-2 h-fit w-fit rounded-full bg-gray-800 hover:bg-gray-700 hover:cursor-pointer'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const previousImageIndex = overlayCurrentImageIndex - 1;
                                        setOverlayCurrentImageIndex(previousImageIndex);
                                        window.history.replaceState(null, '', `/${post.author.username}/status/${post.id}/photo/${previousImageIndex + 1}`);
                                    }}>
                                    <ChevronLeft size={24} className='color-white-1 ' />
                                </button>
                            )}
                            {post.images.length > 1 && overlayCurrentImageIndex + 1 < post.images.length
                                ? (
                                    <button className='absolute z-[100] right-0 m-3 p-2 h-fit w-fit rounded-full bg-gray-800 hover:bg-gray-700 hover:cursor-pointer'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const nextImageIndex = overlayCurrentImageIndex + 1;
                                            setOverlayCurrentImageIndex(nextImageIndex);
                                            window.history.replaceState(null, '', `/${post.author.username}/status/${post.id}/photo/${nextImageIndex + 1}`);
                                        }}>
                                        <ChevronRight size={24} className='color-white-1 ' />
                                    </button>
                                )
                                : null
                            }

                            <div className='relative max-w-[100%] max-h-[80vh] pointer-events-auto' onClick={(e) => e.stopPropagation()} >
                                <Image
                                    src={post.images[overlayCurrentImageIndex]}
                                    alt={`Post image ${overlayCurrentImageIndex}`}
                                    width={1000}
                                    height={1000}
                                    className='object-contain w-full max-w-[100%] max-h-[80vh]'
                                />
                            </div>
                        </div>
                        <div ref={postInfoRef}
                            className={`bg-primary-foreground p-2 border-l-[1px] border-primary-border overflow-y-auto max-h-[100vh] ${!isPostInfoVisible ? 'translate-x-[100%]' : ''}`}>
                            <div>
                                <div className='post'>
                                    <div className='post-header'>
                                        <Link href={`/${post.author.username}`} className='group'>
                                            <Image
                                                src={post.author.profile.profilePicture}
                                                alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                                        </Link>
                                        <div className=''>
                                            <UserHoverCard
                                                author={{
                                                    username: post.author.username,
                                                    name: post.author.profile.name,
                                                    profilePicture: post.author.profile.profilePicture,
                                                    bio: post.author.profile.bio,
                                                    following: post.author['_count'].following,
                                                }}
                                                followersCount={followersCount}
                                                setFollowersCount={setFollowersCount}
                                                isFollowedByTheUser={isFollowedByTheUser}
                                                setIsFollowedByTheUser={setIsFollowedByTheUser}
                                                isFollowingTheUser={isFollowingTheUser} />
                                            <p>@{post.author.username}</p>
                                        </div>
                                    </div>
                                    <div className='post-content flex-col'>
                                        <PostText content={post.content} />
                                    </div>
                                    <div className='post-footer'>
                                        <p>{postTime}</p>
                                        <p className='px-1'>·</p>
                                        <p>{postFormatDate}</p>
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
                                    scrollElementRef={postInfoRef} />
                            </div>
                        </div>
                    </div>,
                    document.body // Append to <body>
                )}
        </>
    )
}
