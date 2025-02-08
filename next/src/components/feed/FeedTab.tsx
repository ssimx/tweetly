import React, { useEffect } from 'react'
import { BasicPostType } from '@/lib/types';
import FeedPost from '../posts/FeedPost';

interface FeedTabType {
    posts: BasicPostType[],
    loadingRef: (node?: Element | null) => void;
    scrollPositionRef: React.RefObject<number>;
    endReached: boolean;
    searchSegments?: string[]
}

export default function FeedTab({ posts, loadingRef, scrollPositionRef, endReached = true, searchSegments }: FeedTabType) {

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

    return (
        <div>
            {
                posts.map((post, index) => (
                    <div key={index}>
                        <FeedPost post={post} searchSegments={searchSegments} />
                        {(index + 1) !== posts.length && <div className='feed-hr-line'></div>}
                    </div>
                ))
            }

            {!endReached && (
                <div ref={loadingRef}>
                    <p>Loading...</p>
                </div>
            )}
        </div>
    )
}
