'use client';
import { getMoreBookmarks } from '@/actions/get-actions';
import { BookmarkPostType } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import BookmarkPost from './BookmarkPost';

export default function BookmarksContent({ initialBookmarks }: { initialBookmarks: { posts: BookmarkPostType[], end: boolean } | undefined }) {
    const [bookmarks, setBookmarks] = useState<BookmarkPostType[] | undefined>(initialBookmarks ? initialBookmarks.posts : undefined);
    
    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [bookmarksCursor, setBookmarksCursor] = useState<number | null | undefined>(initialBookmarks ? initialBookmarks.posts.length !== 0 ? initialBookmarks.posts.slice(-1)[0].id : null : undefined);
    const [bookmarksEndReached, setBookmarksEndReached] = useState<boolean>(initialBookmarks ? initialBookmarks.end : true);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldBookmarks = async () => {
                if (!bookmarksEndReached && bookmarksCursor) {
                    const { posts, end } = await getMoreBookmarks(bookmarksCursor);
                    if (!posts) return;

                    setBookmarks(currentBookmarks => [...currentBookmarks as BookmarkPostType[], ...posts as BookmarkPostType[]]);
                    setBookmarksCursor(posts?.length ? posts.slice(-1)[0].id : null);
                    setScrollPosition(scrollPositionRef.current);
                    setBookmarksEndReached(end);
                }
            };

            fetchOldBookmarks();
        }
    }, [inView, bookmarksCursor, bookmarksEndReached, scrollPosition]);

    useEffect(() => {
        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            { bookmarks === undefined
                ? <div>Something went wrong</div>
                : bookmarks === null
                    ? <div>loading...</div>
                    : bookmarks.length === 0
                        ? <div>No bookmarks</div>
                        : bookmarks.map((post) => (
                            <BookmarkPost key={post.id} post={post} />
                        ))
            }

            {!bookmarksEndReached && (
                <div ref={ref}>
                    <p>Loading...</p>
                </div>
            )}
        </section>
    )
}
