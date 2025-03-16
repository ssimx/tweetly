import React, { useEffect } from 'react'
import FeedPost from '../posts/PostCard';
import { BasePostDataType } from 'tweetly-shared';
import ClipLoader from 'react-spinners/ClipLoader';

type FeedTabType = {
    posts: BasePostDataType[],
    loadingRef: (node?: Element | null) => void;
    scrollPositionRef: React.RefObject<number>;
    endReached: boolean;
    searchSegments?: string[]
};

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
                    <div key={post.id}>
                        <FeedPost post={post} searchSegments={searchSegments} />
                        {(index + 1) !== posts.length && <div className='feed-hr-line'></div>}
                    </div>
                ))
            }

            {!endReached && (
                <div ref={loadingRef} className='w-full flex justify-center my-6'>
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
