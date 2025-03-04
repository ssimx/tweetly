'use client';
import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import Link from "next/link";
import { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { useUserContext } from "@/context/UserContextProvider";
import { bookmarkPost, likePost, removeBookmarkPost, removeLikePost, removeRepostPost, repostPost } from "@/actions/actions";
import { usePostInteractionContext } from "@/context/PostInteractionContextProvider";
import { AnimatePresence, motion } from "framer-motion";
import PostShareButton from './PostShareButton';
import { BasePostDataType } from 'tweetly-shared';

type PostButtonsProps = {
    post: BasePostDataType
    setPostIsVisible?: React.Dispatch<SetStateAction<boolean>>,
};

export default function PostButtons({ post, setPostIsVisible }: PostButtonsProps) {
    const { interactedPosts, updateInteractedPosts } = usePostInteractionContext();
    const { loggedInUser } = useUserContext();
    const actionErrorRef = useRef<HTMLDivElement | null>(null);

    const {
        viewerHasLiked,
        viewerHasReposted,
        viewerHasBookmarked
    } = post.relationship;

    const {
        likesCount,
        repostsCount,
        repliesCount,
    } = post.stats;

    const [reposted, setReposted] = useState(viewerHasReposted);
    const [liked, setLiked] = useState(viewerHasLiked);
    const [bookmarked, setBookmarked] = useState(viewerHasBookmarked);
    const [repostsCounter, setRepostsCounter] = useState(repostsCount);
    const [likesCounter, setLikesCounter] = useState(likesCount);

    const handlePostBtnsInteraction = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, postId: number) => {
            e.stopPropagation();
            e.preventDefault();

            const btn = e.currentTarget;
            const type = btn.dataset.type as string;
            const status = btn.dataset.status;

            btn.disabled = true;

            if (status === 'true') {
                // REMOVE
                try {
                    let response: boolean;
                    switch (type) {
                        case 'repost':
                            if (repostsCounter === 0) throw new Error(`Failed to remove the repost on the post`);

                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: (repostsCounter - 1),
                                likesCount: likesCounter,
                                bookmarked: bookmarked,
                            });

                            response = await removeRepostPost(postId);
                            break;
                        case 'like':
                            if (likesCounter === 0) throw new Error(`Failed to remove the like on the post`);

                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: (likesCounter - 1),
                                bookmarked: bookmarked,
                            });
                            response = await removeLikePost(postId);
                            break;
                        case 'bookmark':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: likesCounter,
                                bookmarked: false,
                            });

                            response = await removeBookmarkPost(postId);
                            break;
                        default:
                            response = false;
                    };

                    if (!response) {
                        throw new Error(`Failed to remove the ${type} on the post`);
                    }

                    btn.dataset.status = 'false';

                    // Call function to hide post on user's profile
                    setPostIsVisible && setPostIsVisible(false);

                    // Update notifications
                    if (type !== 'bookmark') {
                        socket.emit('new_user_notification', loggedInUser.id);
                    }
                } catch (error) {
                    console.log(error);

                    // revert the styling
                    switch (type) {
                        case 'repost':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: (repostsCounter + 1),
                                likesCount: likesCounter,
                                bookmarked: bookmarked,
                            });

                            break;
                        case 'like':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: (likesCounter + 1),
                                bookmarked: bookmarked,
                            });

                            break;
                        case 'bookmark':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: likesCounter,
                                bookmarked: true,
                            });

                            break;
                        default:
                            break;
                    };

                    actionErrorRef.current?.classList.toggle('hidden');
                    setTimeout(() => {
                        actionErrorRef.current?.classList.toggle('hidden');
                    }, 3000);
                }
            } else {
                // ADD
                try {
                    let response: boolean;
                    switch (type) {
                        case 'repost':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: (repostsCounter + 1),
                                likesCount: likesCounter,
                                bookmarked: bookmarked,
                            });

                            response = await repostPost(postId);
                            break;
                        case 'like':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: (likesCounter + 1),
                                bookmarked: bookmarked,
                            });

                            response = await likePost(postId);
                            break;
                        case 'bookmark':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: likesCounter,
                                bookmarked: true,
                            });

                            response = await bookmarkPost(postId);
                            break;
                        default:
                            response = false;
                    };

                    if (!response) {
                        throw new Error(`Failed to ${type} the post`);
                    }

                    btn.dataset.status = 'true';

                    // Update notifications
                    if (type !== 'bookmark') {
                        socket.emit('new_user_notification', loggedInUser.id);
                    }
                } catch (error) {
                    console.log(error);

                    // revert the styling
                    switch (type) {
                        case 'repost':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: (repostsCounter - 1),
                                likesCount: likesCounter,
                                bookmarked: bookmarked,
                            });
                            break;
                        case 'like':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: (likesCounter - 1),
                                bookmarked: bookmarked,
                            });
                            break;
                        case 'bookmark':
                            updateInteractedPosts({
                                postId: postId,
                                repostsCount: repostsCounter,
                                likesCount: likesCounter,
                                bookmarked: false,
                            });
                            break;
                        default:
                            break;
                    };

                    actionErrorRef.current?.classList.toggle('hidden');
                    setTimeout(() => {
                        actionErrorRef.current?.classList.toggle('hidden');
                    }, 3000);
                }
            }

            btn.disabled = false;
        }, [
            loggedInUser.id,
            setPostIsVisible,
            updateInteractedPosts,
            bookmarked,
            likesCounter,
            repostsCounter
        ]
    );

    // For syncing post's button's state if post was interacted with somewhere else (modal)
    useEffect(() => {
        const interactedPost = interactedPosts.get(post.id);
        if (interactedPost) {
            if (interactedPost.repostsCount !== repostsCounter) {
                setReposted(interactedPost.repostsCount > repostsCounter ? true : false)
                setRepostsCounter(interactedPost.repostsCount)
            }

            if (interactedPost.likesCount !== likesCounter) {
                setLiked(interactedPost.likesCount > likesCounter ? true : false)
                setLikesCounter(interactedPost.likesCount)
            }

            setBookmarked(interactedPost.bookmarked);
        }
    }, [post, interactedPosts, likesCounter, repostsCounter]);

    return (
        <>
            <div className="flex gap-2 justify-center items-end">
                <div className='w-[60%] sm:w-[50%] flex gap-1 justify-between'>
                    <Link href={`/${post.author.username}/status/${post.id}`} className='comment-btn group'>
                        <div className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-blue-1/10'>
                            <MessageCircle size={20}
                                className='text-secondary-text group-hover:text-blue-1/70' />
                        </div>
                        <div className='min-w-[24px] text-start'>
                            <p>{repliesCount}</p>
                        </div>
                    </Link>
                    <button
                        className={`repost-btn group ${reposted ? 'reposted' : ''}`}
                        data-type='repost'
                        data-status={`${reposted}`}
                        onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                        <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-green-500/10'>
                            <Repeat2 size={24} className='text-secondary-text group-hover:text-green-500/70' />
                        </span>
                        <div className='min-w-[24px] text-start'>
                            <CounterAnimation value={repostsCounter} />
                        </div>
                    </button>
                    <button
                        className={`like-btn group ${liked ? 'liked' : ''}`}
                        data-type='like'
                        data-status={`${liked}`}
                        onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                        <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                            <Heart size={20} className='text-secondary-text group-hover:text-pink-500' />
                        </span>
                        <div className='min-w-[24px] text-start'>
                            <CounterAnimation value={likesCounter} key={post.id} />
                        </div>
                    </button>
                </div>
                <button
                    className={`bookmark-btn group ${bookmarked ? 'bookmarked' : ''}`}
                    data-type='bookmark'
                    data-status={`${bookmarked}`}
                    onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                    <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                        <Bookmark size={20} className='text-secondary-text group-hover:text-primary ml-[1px]' />
                    </span>
                </button>
                <PostShareButton post={post} />
            </div>

            <div className='profile-copy-alert hidden'
                ref={actionErrorRef} >
                Something went wrong
            </div>
        </>
    )
}

function CounterAnimation({ value }: { value: number }) {
    const [prevValue, setPrevValue] = useState(value);
    const [direction, setDirection] = useState(1);
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        if (value !== prevValue) {
            setDirection(value < prevValue ? 1 : -1);
            setShowAnimation(true);
            setPrevValue(value);
        }
    }, [value, prevValue]);

    return (
        <div className="relative overflow-hidden h-[24px] flex justify-center">
            <AnimatePresence mode="popLayout">
                {showAnimation ? (
                    <motion.span
                        key={value}
                        initial={{ y: direction * 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: direction * -20, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute"
                    >
                        {value}
                    </motion.span>
                ) : (
                    <span>{value}</span> // No animation on first render
                )}
            </AnimatePresence>
        </div>
    );
}