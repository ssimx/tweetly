'use client';
import { BasicPostType, VisitedPostType } from '@/lib/types';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { usePathname, useRouter } from 'next/navigation';
import { usePostInteractionContext } from '@/context/PostInteractionContextProvider';
import BasicPostTemplate from './templates/BasicPostTemplate';
import VisitedPostTemplate from './templates/VisitedPostTemplate';
import { getPostInfo } from '@/actions/get-actions';

export default function VisitedPostInfo({ post, photoId }: { post: VisitedPostType, photoId?: number }) {
    const { suggestions } = useFollowSuggestionContext();
    const { interactedPosts, setInteractedPosts } = usePostInteractionContext();
    const router = useRouter();
    const pathname = usePathname();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // PARENT POST

    // if user is in suggestions, track it's isFollowed property instead
    const [isParentFollowedByTheUser, setParentIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo?.author.username)?.isFollowed
        ?? post.replyTo?.author.followers.length === 1
        ?? false
    );

    // Is post author following the logged in user
    const [isParentFollowingTheUser, setParentIsFollowingTheUser] = useState<boolean>(post.replyTo?.author.following.length === 1);

    // Post author following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [parentFollowingCount, setParentFollowingCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo?.author.username)?._count.following
        ?? post.replyTo?.author._count.following
        ?? 0
    );
    const [parentFollowersCount, setParentFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo?.author.username)?._count.followers
        ?? post.replyTo?.author._count.followers
        ?? 0
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

    const [postInfo, setPostInfo] = useState(post);
    const postRef = useRef<HTMLDivElement>(null);
    const postDate = new Date(post.createdAt);
    const postTime = `${postDate.getHours()}:${postDate.getMinutes()}`;
    const postFormatDate = `${postDate.toLocaleString('default', { month: 'short' })} ${postDate.getDate()}, ${postDate.getFullYear()}`;

    // replies
    const [replies, setReplies] = useState<BasicPostType[]>(post.replies);
    const [repliesCursor, setRepliesCursor] = useState<number | null>(post.replies.length > 0 ? post.replies.slice(-1)[0].id : null);
    const [repliesEndReached, setRepliesEndReached] = useState<boolean>(post.repliesEnd);

    // image overlay state
    const overlayPostInfoRef = useRef<HTMLDivElement>(null);
    const scrollElementRef = useRef<HTMLDivElement>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [flippedOverlay, setFlippedOverlay] = useState(false);
    const [overlayCurrentImageIndex, setOverlayCurrentImageIndex] = useState<number | null>(null);
    const [isPostInfoVisible, setIsPostInfoVisible] = useState(true);

    useEffect(() => {
        if (!pathname.startsWith(`/${post.author.username}/status/${post.id}`)) {
            setIsOverlayVisible(false);
        } else if (pathname.startsWith(`/${post.author.username}/status/${post.id}/photo/`)) {
            setIsOverlayVisible(true);
        }
    }, [post, pathname]);

    useEffect(() => {
        // if interacted posts array is length of 1000, refetch everything so that the data is fresh for more than 1000 posts
        if (interactedPosts.size === 1000 && flippedOverlay) {
            // Refetch post and replies to update post interactions
            const refetchData = async () => {
                const refetchedPost = await getPostInfo(post.id);
                if (!refetchedPost) return;
                setPostInfo(refetchedPost);
                setReplies(refetchedPost.replies);
                setRepliesCursor(refetchedPost.replies.length > 0 ? refetchedPost.replies.slice(-1)[0].id : null);
                setRepliesEndReached(refetchedPost.repliesEnd);
                setInteractedPosts(new Map());
            };

            refetchData();
        }

        setFlippedOverlay(false);
    }, [post.id, flippedOverlay, interactedPosts, setInteractedPosts]);

    useEffect(() => {
        isOverlayVisible
            ? post.replyTo && scrollElementRef.current && overlayPostInfoRef.current && scrollElementRef.current.scrollTo(0, (overlayPostInfoRef.current.offsetTop - 50))
            : post.replyTo && postRef.current && window.scrollTo(0, (postRef.current.offsetTop - 50));
    }, [post.replyTo, isOverlayVisible]);

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
            // clean up map because interacted posts will be re-fetched so context is not needed
            setInteractedPosts(new Map());
        });
    }, [post, photoId, setInteractedPosts]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, authorUsername: string, postId: number) => {
        const targetElement = e.target as HTMLElement;

        // skip any clicks that are not coming from the card element
        if (targetElement.closest('button') || targetElement.closest('img') || targetElement.closest('a')) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        // Otherwise, navigate to the post in new tab
        if (e.button === 1) {
            // Check if it's a middle mouse button click
            e.preventDefault(); // Prevent default middle-click behavior
            const newWindow = window.open(`/${authorUsername}/status/${postId}`, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        } else if (e.button === 0) {
            // Check if it's a left mouse button click
            router.replace(`/${authorUsername}/status/${postId}`);
        }
    };

    const openPhoto = (photoIndex: number, authorUsername: string, postId: number) => {
        document.body.style.overflow = 'hidden';
        window.history.replaceState(null, '', `/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`);
        setIsOverlayVisible(true);
        setOverlayCurrentImageIndex(photoIndex);
        setFlippedOverlay(true);
    };

    const closePhoto = () => {
        document.body.style.overflow = '';
        window.history.replaceState(null, '', `/${post.author.username}/status/${post.id}`);
        setIsOverlayVisible(false);
        setOverlayCurrentImageIndex(null);
        setFlippedOverlay(true);
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <div className='flex flex-col'>
                {postInfo.replyTo && (
                    <div onClick={(e) => handleCardClick(e, postInfo.replyTo!.author.username, post.replyTo!.id)} className='profile-content-post'>
                        <BasicPostTemplate
                            post={postInfo.replyTo}
                            isFollowedByTheUser={isParentFollowedByTheUser}
                            setIsFollowedByTheUser={setParentIsFollowedByTheUser}
                            isFollowingTheUser={isParentFollowingTheUser}
                            setIsFollowingTheUser={setParentIsFollowingTheUser}
                            followingCount={parentFollowingCount}
                            setFollowingCount={setParentFollowingCount}
                            followersCount={parentFollowersCount}
                            setFollowersCount={setParentFollowersCount}
                            openPhoto={openPhoto}
                            type='parent'
                        />
                    </div>
                )}

                <VisitedPostTemplate
                    post={postInfo}
                    postRef={postRef}
                    postTime={postTime}
                    postDate={postFormatDate}
                    replies={replies}
                    setReplies={setReplies}
                    repliesCursor={repliesCursor}
                    setRepliesCursor={setRepliesCursor}
                    repliesEndReached={repliesEndReached}
                    setRepliesEndReached={setRepliesEndReached}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser}
                    isFollowingTheUser={isFollowingTheUser}
                    setIsFollowingTheUser={setIsFollowingTheUser}
                    followingCount={followingCount}
                    setFollowingCount={setFollowingCount}
                    followersCount={followersCount}
                    setFollowersCount={setFollowersCount}
                    openPhoto={openPhoto}
                />
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
                                        window.history.replaceState(null, '', `/${postInfo.author.username}/status/${postInfo.id}/photo/${previousImageIndex + 1}`);
                                    }}>
                                    <ChevronLeft size={24} className='color-white-1 ' />
                                </button>
                            )}
                            {postInfo.images.length > 1 && overlayCurrentImageIndex + 1 < postInfo.images.length
                                ? (
                                    <button className='absolute z-[100] right-0 m-3 p-2 h-fit w-fit rounded-full bg-gray-800 hover:bg-gray-700 hover:cursor-pointer'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const nextImageIndex = overlayCurrentImageIndex + 1;
                                            setOverlayCurrentImageIndex(nextImageIndex);
                                            window.history.replaceState(null, '', `/${postInfo.author.username}/status/${postInfo.id}/photo/${nextImageIndex + 1}`);
                                        }}>
                                        <ChevronRight size={24} className='color-white-1 ' />
                                    </button>
                                )
                                : null
                            }

                            <div className='relative max-w-[100%] max-h-[80vh] pointer-events-auto' onClick={(e) => e.stopPropagation()} >
                                <Image
                                    src={postInfo.images[overlayCurrentImageIndex]}
                                    alt={`Post image ${overlayCurrentImageIndex}`}
                                    width={1000}
                                    height={1000}
                                    className='object-contain w-full max-w-[100%] max-h-[80vh]'
                                />
                            </div>
                        </div>
                        <div ref={scrollElementRef}
                            className={`bg-primary-foreground p-2 border-l-[1px] border-primary-border overflow-y-auto max-h-[100vh] ${!isPostInfoVisible ? 'translate-x-[100%]' : null}`} >

                            {post.replyTo && (
                                <div
                                    className='px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
                                    role="link"
                                    tabIndex={0}
                                    aria-label={`View post by ${post.replyTo!.author.username} that was replied to`}
                                    onMouseDown={(e) => handleCardClick(e, post.replyTo!.author.username, post.replyTo!.id)} >

                                    <BasicPostTemplate
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
                                        type='parent'
                                    />

                                </div>
                            )}

                            <VisitedPostTemplate
                                post={postInfo}
                                postRef={overlayPostInfoRef}
                                scrollRef={scrollElementRef}
                                postTime={postTime}
                                postDate={postFormatDate}
                                replies={replies}
                                setReplies={setReplies}
                                repliesCursor={repliesCursor}
                                setRepliesCursor={setRepliesCursor}
                                repliesEndReached={repliesEndReached}
                                setRepliesEndReached={setRepliesEndReached}
                                isFollowedByTheUser={isFollowedByTheUser}
                                setIsFollowedByTheUser={setIsFollowedByTheUser}
                                isFollowingTheUser={isFollowingTheUser}
                                setIsFollowingTheUser={setIsFollowingTheUser}
                                followingCount={followingCount}
                                setFollowingCount={setFollowingCount}
                                followersCount={followersCount}
                                setFollowersCount={setFollowersCount}
                                openPhoto={openPhoto}
                                type='overlay'
                            />
                        </div>
                    </div>,
                    document.body // Append to <body>
                )}
        </>
    )
}