'use client';

import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePostInteraction } from "@/context/PostInteractionContextProvider";
import { AnimatePresence, motion } from "framer-motion";
import PostShareButton from './PostShareButton';
import { ApiResponse, BasePostDataType } from 'tweetly-shared';
import { useAlertMessageContext } from '@/context/AlertMessageContextProvider';

export default function PostButtons({ post }: { post: BasePostDataType }) {
    const { setAlertMessage } = useAlertMessageContext();
    const { interaction, toggleRepost, toggleLike, toggleBookmark } = usePostInteraction(post);

    const handlePostInteraction = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            e.preventDefault();

            const btn = e.currentTarget;
            const type = btn.dataset.type as 'repost' | 'like' | 'bookmark';

            btn.disabled = true;
            let response: ApiResponse<undefined>;

            switch (type) {
                case 'repost':
                    response = await toggleRepost();
                    if (!response.success) {
                        if (response.error.code === 'NOT_FOUND' || response.error.code === 'USER_BLOCKED') {
                            setAlertMessage(response.error.message);
                            break;
                        }
                        setAlertMessage(`Failed to ${interaction.reposted ? 'unrepost' : 'repost'} the post`);
                    }

                    break;
                case 'like':
                    response = await toggleLike();
                    if (!response.success) {
                        if (response.error.code === 'NOT_FOUND' || response.error.code === 'USER_BLOCKED') {
                            setAlertMessage(response.error.message);
                            break;
                        }
                        setAlertMessage(`Failed to ${interaction.liked ? 'unlike' : 'like'} the post`);
                    }

                    break;
                case 'bookmark':
                    response = await toggleBookmark();
                    if (!response.success) {
                        if (response.error.code === 'NOT_FOUND' || response.error.code === 'USER_BLOCKED') {
                            setAlertMessage(response.error.message);
                            break;
                        }
                        setAlertMessage(`Failed to ${interaction.bookmarked ? 'unbookmark' : 'bookmark'} the post`);
                    } else {
                        setAlertMessage(`Post ${interaction.bookmarked ? 'unsaved' : 'saved'}`);
                    }

                    break;
                default:
                    setAlertMessage(`Something went wrong`);
                    response = {
                        success: false,
                        error: {
                            message: 'Internal Server Error',
                            code: 'INTERNAL_ERROR',
                        }
                    };
            }

            // Re-enable the button
            btn.disabled = false;
        }, [setAlertMessage, toggleBookmark, toggleLike, toggleRepost, interaction]
    );

    return (
        <>
            <div className="flex gap-2 justify-center items-end">
                <div className='w-[60%] sm:w-[50%] flex gap-1 justify-between'>
                    <Link href={`/${post.author.username}/status/${post.id}`} className='flex items-center hover:text-blue-1/70 group'>
                        <div className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-blue-1/10'>
                            <MessageCircle size={20}
                                className='text-secondary-text group-hover:text-blue-1/70' />
                        </div>
                        <div className='min-w-[24px] text-start'>
                            <p>{post.stats.repliesCount}</p>
                        </div>
                    </Link>

                    <button
                        className={`flex items-center hover:text-green-500/7 group ${interaction.reposted ? '[&_svg]:text-green-500/70 [&_p]:text-green-500/70' : ''}`}
                        data-type='repost'
                        data-status={`${interaction.reposted.toString()}`}
                        onClick={(e) => handlePostInteraction(e)}>
                        <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-green-500/10'>
                            <Repeat2 size={24} className='text-secondary-text group-hover:text-green-500/70' />
                        </span>
                        <div className='min-w-[24px] text-start'>
                            <CounterAnimation value={interaction.repostsCount} />
                        </div>
                    </button>

                    <button
                        className={`flex items-center hover:text-pink-500 group ${interaction.liked ? '[&_svg]:text-pink-500 [&_svg]:fill-pink-500 [&_p]:text-pink-500' : ''}`}
                        data-type='like'
                        data-status={`${interaction.liked.toString()}`}
                        onClick={(e) => handlePostInteraction(e)}>
                        <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                            <Heart size={20} className='text-secondary-text group-hover:text-pink-500' />
                        </span>
                        <div className='min-w-[24px] text-start'>
                            <CounterAnimation value={interaction.likesCount} key={post.id} />
                        </div>
                    </button>
                </div>
                <button
                    className={`flex-center ml-auto h-[35px] w-[35px] rounded-full hover:bg-blue-1/10 group ${interaction.bookmarked ? '[&_svg]:text-primary [&_svg]:fill-primary' : ''}`}
                    data-type='bookmark'
                    data-status={`${interaction.bookmarked.toString()}`}
                    onClick={(e) => handlePostInteraction(e)}>
                    <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                        <Bookmark size={20} className='text-secondary-text group-hover:text-primary ml-[1px]' />
                    </span>
                </button>
                <PostShareButton post={post} />
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