import { PostType } from '@/lib/types'
import React, { useEffect } from 'react'
import FeedPost from './FeedPost'

interface FeedTabType {
    posts: PostType[],
    loadingRef: (node?: Element | null) => void;
    scrollPositionRef: React.MutableRefObject<number>;
    endReached: boolean;
}

export default function FeedTab({ posts, loadingRef, scrollPositionRef, endReached }: FeedTabType) {
    console.log(posts);

    // Track scroll position on user scroll
    function handleScroll() {
        scrollPositionRef.current = window.scrollY;
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    return (
        <div>
            {
                posts.map((post, index) => (
                    <div key={index}>
                        <FeedPost post={post} />
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
