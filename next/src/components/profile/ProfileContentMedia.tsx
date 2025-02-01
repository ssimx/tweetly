'use client';
import { useEffect } from 'react';
import 'react-photo-view/dist/react-photo-view.css';
import PostMediaViewer from '../PostMediaViewer';
import { BasicPostType } from '@/lib/types';

interface ProfileContentMediaType {
    media: BasicPostType[],
    loadingRef: (node?: Element | null) => void;
    scrollPositionRef: React.RefObject<number>;
    endReached: boolean;
}

export default function ProfileContentMedia({ media, loadingRef, scrollPositionRef, endReached }: ProfileContentMediaType) {

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
        <div className='p-2 w-full h-full grid grid-cols-3 gap-2'>
            { media.map((post) => (
                <PostMediaViewer key={post.id} post={post} />
            ))}

            {!endReached && (
                <div ref={loadingRef}>
                    <p>Loading...</p>
                </div>
            )}
        </div>
    )
}
