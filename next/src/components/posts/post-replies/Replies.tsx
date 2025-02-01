'use client';
import { BasicPostType } from '@/lib/types';
import ReplyPost from './Reply';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function PostReplies({ replies, repliesEnd }: { replies: BasicPostType[], repliesEnd: boolean }) {
    const [replyPosts, setReplyPosts] = useState<BasicPostType[]>(replies);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [repliesCursor, setRepliesCursor] = useState<number | null>(replies.length > 0 ? replies.slice(-1)[0].id : null);
    const [endReached, setEndReached] = useState(repliesEnd);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    useEffect(() => {
        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollPositionRef]);

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && !endReached && scrollPositionRef.current !== scrollPosition) {
            const fetchMoreReplies = async () => {
                const response = await fetch(`http://localhost:3000/api/posts/replies/${replyPosts[0].replyToId}?cursor=${repliesCursor}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache',
                });
                const { moreReplies, end }: { moreReplies: PostType[], end: boolean } = await response.json();

                if (moreReplies.length === 0) {
                    setEndReached(currentValue => !currentValue);
                    return;
                }

                setRepliesCursor(moreReplies[moreReplies.length === 0 ? 0 : moreReplies.length - 1].id);
                setReplyPosts(currentPosts => [...currentPosts as PostType[], ...moreReplies]);
                end && setEndReached(currentValue => !currentValue);
                setScrollPosition(scrollPositionRef.current);
            };

            fetchMoreReplies();
        }
    }, [replyPosts, inView, repliesCursor, endReached, scrollPosition]);

    return (
        <div>
            {replyPosts.map((reply) => (
                <div key={reply.id}>
                    <ReplyPost post={reply} />

                    <hr className='feed-hr-line' />
                </div>
            ))}

            {!endReached && (
                <div ref={ref}>
                    <p>Loading...</p>
                </div>
            )}
        </div>
    )
}
