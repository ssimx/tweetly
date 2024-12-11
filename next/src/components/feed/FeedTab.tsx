import { PostType } from '@/lib/types'
import React, { useEffect } from 'react'
import FeedPost from './FeedPost'

interface FeedTabType {
    posts: PostType[],
    loadingRef: (node?: Element | null) => void;
    scrollPositionRef: React.MutableRefObject<number>;
    endReached: boolean;
    searchSegments?: string[]
}

export default function FeedTab({ posts, loadingRef, scrollPositionRef, endReached, searchSegments }: FeedTabType) {

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
                        <div className='feed-hr-line'></div>
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
