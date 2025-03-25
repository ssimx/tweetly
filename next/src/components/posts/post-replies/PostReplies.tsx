'use client';
import ReplyPost from './PostReply';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getMoreRepliesForPost } from '@/actions/get-actions';
import { BasePostDataType, ErrorResponse, getErrorMessage } from 'tweetly-shared';
import ClipLoader from 'react-spinners/ClipLoader';

type PostRepliesType = {
    parentPostId: number,
    replies: BasePostDataType[],
    setReplies: React.Dispatch<React.SetStateAction<BasePostDataType[]>>,
    repliesCursor: number | null,
    setRepliesCursor: React.Dispatch<React.SetStateAction<number | null>>,
    repliesEndReached: boolean,
    setRepliesEndReached: React.Dispatch<React.SetStateAction<boolean>>,
    scrollElementRef?: React.RefObject<HTMLDivElement | null>,
};

export default function PostReplies({ parentPostId, replies, setReplies, repliesCursor, setRepliesCursor, repliesEndReached, setRepliesEndReached, scrollElementRef }: PostRepliesType) {
    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);

    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    useEffect(() => {
        // Track scroll position on user scroll with throttling
        let ticking = false;

        const scrollElement = scrollElementRef?.current;

        // Track scroll position on user scroll for element
        function handleScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    scrollPositionRef.current = scrollElement ? scrollElement.scrollTop : window.scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }

        scrollElement
            ? scrollElement.addEventListener('scroll', handleScroll, { passive: true })
            : window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            scrollElement
                ? scrollElement.removeEventListener('scroll', handleScroll)
                : window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollElementRef, scrollPositionRef]);

    // Infinite scroll - fetch more replies when inView is true
    useEffect(() => {
        if (inView && !repliesEndReached && scrollPositionRef.current !== scrollPosition) {
            const fetchMoreReplies = async () => {
                try {
                    const response = await getMoreRepliesForPost(parentPostId, Number(repliesCursor));

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response;
                    if (!data) throw new Error('Data is missing in response');
                    else if (data.replies === undefined) throw new Error('Replies property is missing in data response');
                    else if (data.replies.posts === undefined) throw new Error('Posts property is missing in replies response');
                    else if (data.replies.cursor === undefined) throw new Error('Replies cursor property is missing in replies response');

                    setReplies(currentPosts => [...currentPosts as BasePostDataType[], ...data.replies.posts as BasePostDataType[]]);
                    setRepliesCursor(data.replies.cursor);
                    setRepliesEndReached(data.replies.end);
                } catch (error: unknown) {
                    const errorMessage = getErrorMessage(error);
                    console.error(errorMessage);

                    setRepliesCursor(null);
                    setRepliesEndReached(true);
                } finally {
                    setScrollPosition(scrollPositionRef.current);
                }
            };

            fetchMoreReplies();
        }
    }, [parentPostId, inView, repliesCursor, repliesEndReached, scrollPosition, setReplies, setRepliesCursor, setRepliesEndReached]);

    return (
        <div>
            {replies.map((reply) => (
                <div key={reply.id}>
                    <ReplyPost post={reply} />

                    <hr className='feed-hr-line' />
                </div>
            ))}

            {!repliesEndReached && (
                <div ref={ref} className='w-full flex justify-center mt-6'>
                    <ClipLoader
                        className='loading-spinner'
                        loading={true}
                        size={25}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            )}
        </div>
    )
}
