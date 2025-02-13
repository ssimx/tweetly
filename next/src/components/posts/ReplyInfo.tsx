'use client';
import { BasicPostType, VisitedPostType } from '@/lib/types';
import Image from 'next/image';
import PostBtns from './PostBtns';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useEffect, useRef, useState } from 'react';
import PostText from './PostText';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import NewPost from '../feed/NewPost';
import PostReplies from './post-replies/PostReplies';
import PostReplyParent from './post-replies/PostReplyParent';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';

export default function ReplyInfo({ post, photoId }: { post: VisitedPostType, photoId?: number }) {
    const { suggestions } = useFollowSuggestionContext();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // PARENT POST

    const [isParentFollowedByTheUser, setParentIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo!.author.username)?.isFollowed
        ?? post.replyTo!.author.followers.length === 1
    );

    const [isParentFollowingTheUser] = useState<boolean>(post.replyTo.author.following.length === 1);

    const [parentFollowingCount, setParentFollowingCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo!.author.username)?._count.following
        ?? post.replyTo!.author._count.following
    );

    const [parentFollowersCount, setParentFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo!.author.username)?._count.followers
        ?? post.replyTo!.author._count.followers
    );

    // ORIGINAL POST

    // if user is in suggestions, track it's isFollowed property instead
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?.isFollowed
        ?? post.author.followers.length === 1
    );

    // Is post author following the logged in user
    const [isFollowingTheUser, setIsFollowingTheUser] = useState<boolean>(post.author.following.length === 1);

    // Post author following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [followingCount, setFollowingCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.following
        ?? post.author._count.following
    );
    const [followersCount, setFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.followers
        ?? post.author._count.followers
    );

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
    const postReplyRef = useRef<HTMLDivElement>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [overlayCurrentImageIndex, setOverlayCurrentImageIndex] = useState<number | null>(null);
    const [isPostInfoVisible, setIsPostInfoVisible] = useState(true);

    useEffect(() => {
        const suggestedUsers = suggestions?.filter((suggestedUser) => suggestedUser.username === post.replyTo?.author.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === post.replyTo?.author.username) {
                    setParentIsFollowedByTheUser(suggestedUsers[index].isFollowed);
                    setParentFollowingCount(suggestedUsers[index]._count.following);
                    setParentFollowersCount(suggestedUsers[index]._count.followers);
                } else if (user.username === post.author.username) {
                    setIsFollowedByTheUser(suggestedUsers[index].isFollowed);
                    setFollowingCount(suggestedUsers[index]._count.following);
                    setFollowersCount(suggestedUsers[index]._count.followers);
                }
            });

        }
    }, [suggestions, post]);

    useEffect(() => {
        isOverlayVisible && (post.replyTo && postReplyRef.current && postInfoRef.current) && postInfoRef.current.scrollTo(0, (postReplyRef.current.offsetTop - 15));
    }, [isOverlayVisible, post.replyTo]);

    useEffect(() => {
        postRef.current && window.scrollTo(0, (postRef.current.offsetTop - 15));

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
    }, [post, photoId]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

    return (
        <>
            <div className='w-full h-fit flex flex-col'>
                <div
                    className='px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
                    role="link"
                    tabIndex={0}
                    aria-label={`View post by ${post.author.username} that was replied to`}
                    onMouseDown={(e) => handleCardClick(e, post.replyTo.author.username, post.replyTo.id)} >

                    <Post
                        post={post.replyTo}
                        isFollowedByTheUser={isParentFollowedByTheUser}
                        setIsFollowedByTheUser={setParentIsFollowedByTheUser}
                        isFollowingTheUser={isParentFollowingTheUser}
                        setIsFollowingTheUser={setParentIsFollowingTheUser}
                        followingCount={parentFollowingCount}
                        setFollowingCount={setParentFollowingCount}
                        followersCount={parentFollowersCount}
                        setFollowersCount={setParentFollowersCount}
                        openPhoto={openPhoto}
                        type={'parent'}
                    />

                </div>

                <div
                    className='px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
                    role="link"
                    tabIndex={0}
                    aria-label={`View reply post by ${post.author.username}`}
                    onMouseDown={(e) => handleCardClick(e, post.author.username, post.id)} >

                    <Post
                        post={post}
                        isFollowedByTheUser={isReplyFollowedByTheUser}
                        setIsFollowedByTheUser={setReplyIsFollowedByTheUser}
                        isFollowingTheUser={isReplyFollowingTheUser}
                        setIsFollowingTheUser={setReplyIsFollowingTheUser}
                        followingCount={replyFollowingCount}
                        setFollowingCount={setReplyFollowingCount}
                        followersCount={replyFollowersCount}
                        setFollowersCount={setReplyFollowersCount}
                        openPhoto={openPhoto}
                    />

                </div>
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
                            {parentPost && (
                                <PostReplyParent post={parentPost} />
                            )}

                            <div>
                                <div className='post' ref={postReplyRef}>
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
