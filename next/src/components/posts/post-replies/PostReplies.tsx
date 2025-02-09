'use client';
import { BasicPostType } from '@/lib/types';
import ReplyPost from './PostReply';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getMoreRepliesForPost } from '@/actions/get-actions';

type PostRepliesType = {
    parentPostId: number,
    replies: BasicPostType[],
    setReplies: React.Dispatch<React.SetStateAction<BasicPostType[]>>,
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
        const scrollElement = scrollElementRef?.current;

        // Track scroll position on user scroll for element
        const handleScroll = () => {
            scrollPositionRef.current = scrollElement ? scrollElement.scrollTop : window.scrollY;
        };

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
        console.log(inView, scrollPositionRef.current, scrollPosition)
        if (inView && !repliesEndReached && scrollPositionRef.current !== scrollPosition) {
            const fetchMoreReplies = async () => {
                const { posts, end } = await getMoreRepliesForPost(parentPostId, repliesCursor as number);
                
                setRepliesCursor(posts?.length ? posts.slice(-1)[0].id : null);
                setReplies(currentPosts => [...currentPosts as BasicPostType[], ...posts as BasicPostType[]]);
                setRepliesEndReached(end);
                setScrollPosition(scrollPositionRef.current);
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
                <div ref={ref}>
                    <p>Loading...</p>
                </div>
            )}
        </div>
    )
}
