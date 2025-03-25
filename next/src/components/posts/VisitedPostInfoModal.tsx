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
import { formatPostDate } from '@/lib/utils';

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
    const postTime = formatPostDate(postDate);
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
            document.body.style.overflowY = '';
            setIsOverlayVisible(false);
        } else if (pathname.startsWith(`/${post.author.username}/status/${post.id}/photo/`)) {
            document.body.style.overflowY = 'hidden';
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
        document.body.style.overflowY = 'hidden';

        return (() => {
            document.body.style.overflowY = '';
        });
    }, [post.replyTo]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const openPhoto = (photoIndex: number, authorUsername: string, postId: number) => {
        document.body.style.overflow = '';
        router.push(`http://192.168.1.155:3000/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
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
                    <div className={`overflow-y-scroll custom-scrollbar min-h-screen h-auto fixed inset-0 z-50 bg-black-1/90 flex flex-col xl:overflow-y-hidden xl:grid xl:grid-rows-1 ${!isPostInfoVisible ? 'xl:grid-cols-[100%]' : 'xl:grid-cols-[70%,30%]'}`} >

                        <div className='relative h-[70vh] xl:h-[100vh] flex-center shrink-0' onClick={closePhoto}>
                            <button className='absolute z-[100] inset-0 m-3 p-2 h-fit w-fit rounded-full opacity-90 bg-secondary-foreground hover:opacity-100 hover:cursor-pointer'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closePhoto();
                                }}>
                                <X size={24} className='color-white-1 ' />
                            </button>
                            <button className='hidden xl:block absolute z-[100] right-0 top-0 m-3 p-2 h-fit w-fit rounded-full opacity-90 bg-secondary-foreground hover:opacity-100 hover:cursor-pointer'
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
                            className={`w-full h-auto sm:flex sm:grow sm:justify-center xl:block bg-primary-foreground p-2 border-l-[1px] border-primary-border xl:max-h-[100vh] xl:overflow-y-auto ${!isPostInfoVisible ? 'translate-x-[100%]' : ''}`}
                        >

                            <div className='h-fit sm:border-x sm:w-[80%] md:w-[70%] xl:border-x-0 xl:w-full'>
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

                        </div>
                    </div>,
                    document.body // Append to <body>
                )
            }
        </>
    )
}
