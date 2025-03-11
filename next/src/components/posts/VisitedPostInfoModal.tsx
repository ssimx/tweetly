'use client';
import Image from 'next/image';
import { useEffect, useReducer, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import VisitedPostTemplate from './templates/VisitedPostTemplate';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';
import { BasePostDataType, VisitedPostDataType } from 'tweetly-shared';

export default function VisitedPostInfoModal({ post, photoId }: { post: VisitedPostDataType, photoId: number }) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const router = useRouter();
    const pathname = usePathname();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const userInitialState: UserStateType = {
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
    const [userState, dispatch] = useReducer(userInfoReducer, userInitialState);

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
    const [isOverlayVisible, setIsOverlayVisible] = useState(true);
    const [overlayCurrentImageIndex, setOverlayCurrentImageIndex] = useState<number>(photoId - 1);
    const [isPostInfoVisible, setIsPostInfoVisible] = useState(true);

    // For handling overlay
    useEffect(() => {
        if (!pathname.startsWith(`/${post.author.username}/status/${post.id}/photo/`)) {
            document.body.style.overflow = '';
            setIsOverlayVisible(false);
        } else if (pathname.startsWith(`/${post.author.username}/status/${post.id}/photo/`)) {
            document.body.style.overflow = 'hidden';
            setIsOverlayVisible(true);
        }
    }, [post, pathname]);

    // For syncing author's state if they appear in different places at the same time
    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === post.author.username);
        if (suggestedUser) {
            dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
        }
    }, [userFollowSuggestions, dispatch, post.author.username]);

    // For handling scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return (() => {
            document.body.style.overflow = '';
        });
    }, [post.replyTo]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const openPhoto = (photoIndex: number, authorUsername: string, postId: number) => {
        document.body.style.overflow = '';
        router.push(`http://localhost:3000/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
    };

    const closePhoto = () => {
        document.body.style.overflow = '';
        router.back();
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // photoId validity checkup
    if (!post.images?.length || photoId < 1 || photoId > post.images.length) {
        router.back();
    }

    return (
        <>
            {isOverlayVisible &&
                createPortal(
                    <div className={`fixed inset-0 z-50 bg-black-1/50 grid ${!isPostInfoVisible ? 'grid-cols-[100%]' : 'grid-cols-[80%,20%]'}`} >
                        <div className='relative h-[100vh] flex-center' onClick={closePhoto}>
                            <button className='absolute z-[100] inset-0 m-3 p-2 h-fit w-fit rounded-full bg-gray-800 hover:bg-gray-700 hover:cursor-pointer'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closePhoto();
                                }}>
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
                        <div ref={scrollElementRef}
                            className={`bg-primary-foreground p-2 border-l-[1px] border-primary-border overflow-y-auto max-h-[100vh] ${!isPostInfoVisible ? 'translate-x-[100%]' : null}`} >

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
                                userState={userState}
                                dispatch={dispatch}
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
