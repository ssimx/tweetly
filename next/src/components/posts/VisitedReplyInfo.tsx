'use client';
import Image from 'next/image';
import { useEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { usePathname, useRouter } from 'next/navigation';
import BasicPostTemplate from './templates/BasicPostTemplate';
import VisitedPostTemplate from './templates/VisitedPostTemplate';
import { BasePostDataType, VisitedPostDataType } from 'tweetly-shared';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';

export default function VisitedReplyInfo({ post, photoId }: { post: VisitedPostDataType, photoId?: number }) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const router = useRouter();
    const pathname = usePathname();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // PARENT POST IS NOT NECESSARILY PROFILE USER'S OWN POST SO IT NEEDS NEW STATE IF THAT'S THE CASE
    const parentInitialState: UserStateType = {
        relationship: {
            isFollowingViewer: post.replyTo!.author.relationship.isFollowingViewer,
            hasBlockedViewer: post.replyTo!.author.relationship.hasBlockedViewer,
            isFollowedByViewer: post.replyTo!.author.relationship.isFollowedByViewer,
            isBlockedByViewer: post.replyTo!.author.relationship.isBlockedByViewer,
            notificationsEnabled: post.replyTo!.author.relationship.notificationsEnabled,
        },
        stats: {
            followersCount: post.replyTo!.author.stats.followersCount,
            followingCount: post.replyTo!.author.stats.followingCount,
            postsCount: post.replyTo!.author.stats.postsCount,
        }
    };
    const [parentUserState, parentDispatch] = useReducer(userInfoReducer, parentInitialState);

    // ORIGINAL POST
    const replyInitialState: UserStateType = {
        relationship: {
            isFollowingViewer: post.author.relationship.isFollowingViewer,
            hasBlockedViewer: post.author.relationship.hasBlockedViewer,
            isFollowedByViewer: post.author.relationship.isFollowedByViewer,
            isBlockedByViewer: post.author.relationship.isBlockedByViewer,
        },
        stats: {
            followersCount: post.author.stats.followersCount,
            followingCount: post.author.stats.followingCount,
            postsCount: post.author.stats.postsCount,
        }
    };
    const [replyUserState, replyDispatch] = useReducer(userInfoReducer, replyInitialState);

    const postRef = useRef<HTMLDivElement>(null);
    const postDate = new Date(post.createdAt);
    const postTime = `${postDate.getHours()}:${postDate.getMinutes()}`;
    const postFormatDate = `${postDate.toLocaleString('default', { month: 'short' })} ${postDate.getDate()}, ${postDate.getFullYear()}`;

    // replies
    const [replies, setReplies] = useState<BasePostDataType[]>(post.replies.posts);
    const [repliesCursor, setRepliesCursor] = useState<number | null>(post.replies.cursor);
    const [repliesEndReached, setRepliesEndReached] = useState<boolean>(post.replies.end);

    // image overlay state
    const overlayPostInfoRef = useRef<HTMLDivElement>(null);
    const scrollElementRef = useRef<HTMLDivElement>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [overlayCurrentImageIndex, setOverlayCurrentImageIndex] = useState<number | null>(null);
    const [isPostInfoVisible, setIsPostInfoVisible] = useState(true);
    const imageRef = useRef(null);

    // For auto focusing replyTo scroll
    useEffect(() => {
        isOverlayVisible
            ? post.replyTo && scrollElementRef.current && overlayPostInfoRef.current && scrollElementRef.current.scrollTo(0, (overlayPostInfoRef.current.offsetTop - 50))
            : post.replyTo && postRef.current && window.scrollTo(0, (postRef.current.offsetTop - 50));
    }, [post.replyTo, isOverlayVisible]);

    // For syncing author's state if they appear in different places at the same time
    useEffect(() => {
        const suggestedUsers = userFollowSuggestions?.filter((suggestedUser) => suggestedUser.username === post.replyTo?.author.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === post.replyTo?.author.username) {
                    parentDispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
                } else if (user.username === post.author.username) {
                    replyDispatch({ type: suggestedUsers[index].relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
                }
            });

        }
    }, [userFollowSuggestions, replyDispatch, post]);

    // Handle body scroll
    useEffect(() => {
        if (isOverlayVisible) {
            document.body.style.overflowY = 'hidden';
        } else {
            document.body.style.overflowY = '';
        }
    }, [isOverlayVisible]);

    // If clicked url contains photo in url, auto open the overlay
    useEffect(() => {
        if (!pathname.startsWith(`/${post.author.username}/status/${post.id}`)) {
            setIsOverlayVisible(false);
        } else if (pathname.startsWith(`/${post.author.username}/status/${post.id}/photo/`)) {
            setIsOverlayVisible(true);
        }
    }, [post, pathname]);

    // photoId validity checkup on url load
    useEffect(() => {
        if (photoId) {
            if (!post.images?.length || photoId < 1 || photoId > post.images.length) {
                // If photoId is less than 1 and more than number of images in the post, revert to non-overlay
                setIsOverlayVisible(false);
                window.history.replaceState(null, '', `/${post.author.username}/status/${post.id}`);
            } else {
                setIsOverlayVisible(true);
                setOverlayCurrentImageIndex(photoId - 1);
            }
        }
    }, [post, photoId]);

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
        window.history.replaceState(null, '', `/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`);
        setIsOverlayVisible(true);
        setOverlayCurrentImageIndex(photoIndex);
    };

    const closePhoto = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === imageRef.current) return;

        window.history.replaceState(null, '', `/${post.author.username}/status/${post.id}`);
        setIsOverlayVisible(false);
        setOverlayCurrentImageIndex(null);
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <div className='flex flex-col'>

                <div onClick={(e) => handleCardClick(e, post.replyTo!.author.username, post.replyTo!.id)} className='w-full flex flex-col gap-2 px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'>
                    <BasicPostTemplate
                        post={post.replyTo as BasePostDataType}
                        userState={parentUserState}
                        dispatch={parentDispatch}
                        openPhoto={openPhoto}
                        type='parent'
                    />
                </div>

                <VisitedPostTemplate
                    post={post}
                    postRef={postRef}
                    postTime={postTime}
                    postDate={postFormatDate}
                    replies={replies}
                    setReplies={setReplies}
                    repliesCursor={repliesCursor}
                    setRepliesCursor={setRepliesCursor}
                    repliesEndReached={repliesEndReached}
                    setRepliesEndReached={setRepliesEndReached}
                    userState={replyUserState}
                    dispatch={replyDispatch}
                    openPhoto={openPhoto}
                />
            </div>

            {(isOverlayVisible && overlayCurrentImageIndex !== null) &&
                createPortal(
                    <div className={`overflow-y-scroll overflow-x-hidden min-h-dvh h-auto fixed inset-0 z-[9999] bg-black-1/90 flex flex-col lg:overflow-y-hidden lg:grid lg:grid-rows-1 ${!isPostInfoVisible ? 'lg:grid-cols-[100%]' : 'lg:grid-cols-[65%,35%] xl:grid-cols-[1fr,minmax(25%,500px)]'}`} >

                        <div className='relative h-[70vh] lg:h-[100vh] flex-center shrink-0' onClick={(e) => closePhoto(e)}>
                            <button className='absolute z-[100] inset-0 m-3 p-2 h-fit w-fit rounded-full opacity-90 bg-secondary-foreground hover:opacity-100 hover:cursor-pointer'>
                                <X size={24} className='color-white-1 ' />
                            </button>
                            <button className='hidden lg:block absolute z-[100] right-0 top-0 m-3 p-2 h-fit w-fit rounded-full opacity-90 bg-secondary-foreground hover:opacity-100 hover:cursor-pointer'
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
                                <button className='absolute z-[100] left-0 m-3 p-2 h-fit w-fit rounded-full opacity-40 bg-secondary-foreground hover:opacity-100 hover:cursor-pointer'
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
                                    <button className='absolute z-[100] right-0 m-3 p-2 h-fit w-fit rounded-full opacity-40 bg-secondary-foreground hover:opacity-100 hover:cursor-pointer'
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

                            <div className='w-auto max-w-[90%] h-[80%]'>
                                <Image
                                    ref={imageRef}
                                    src={post.images[overlayCurrentImageIndex]}
                                    alt={`Post image ${overlayCurrentImageIndex}`}
                                    height={1000}
                                    width={1000}
                                    className='object-contain h-full w-auto'
                                />
                            </div>
                        </div>

                        <div
                            ref={scrollElementRef}
                            className={`w-full h-auto sm:flex sm:grow sm:justify-center lg:block bg-primary-foreground p-2 border-l-[1px] border-primary-border lg:max-h-[100vh] lg:overflow-y-auto ${!isPostInfoVisible ? 'translate-x-[100%]' : ''}`}
                        >

                            <div
                                className='px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
                                role="link"
                                tabIndex={0}
                                aria-label={`View post by ${post.replyTo!.author.username} that was replied to`}
                                onMouseDown={(e) => handleCardClick(e, post.replyTo!.author.username, post.replyTo!.id)} >

                                <BasicPostTemplate
                                    post={post.replyTo as BasePostDataType}
                                    userState={parentUserState}
                                    dispatch={parentDispatch}
                                    openPhoto={openPhoto}
                                    type='parent'
                                />
                            </div>

                            <VisitedPostTemplate
                                post={post}
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
                                userState={replyUserState}
                                dispatch={replyDispatch}
                                openPhoto={openPhoto}
                                type='overlay'
                            />

                        </div>
                    </div>,
                    document.body // Append to <body>
                )
            }
        </>
    )
}