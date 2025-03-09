'use client';
import { getMoreBookmarks } from '@/actions/get-actions';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import FeedPost from '../posts/PostCard';
import BookmarkReply from './BookmarkReply';
import { BasePostDataType, ErrorResponse, getErrorMessage } from 'tweetly-shared';

export default function BookmarksContent({ initialBookmarks, cursor, end }: { initialBookmarks: BasePostDataType[] | null, cursor: number | null, end: boolean }) {
    const [bookmarks, setBookmarks] = useState<BasePostDataType[] | null>(initialBookmarks);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [bookmarksCursor, setBookmarksCursor] = useState<number | null>(cursor);
    const [bookmarksEndReached, setBookmarksEndReached] = useState<boolean>(end);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldBookmarks = async () => {
                if ((!bookmarksEndReached && bookmarksCursor)) {
                    try {
                        const response = await getMoreBookmarks(bookmarksCursor);
                        
                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.bookmarks === undefined) throw new Error('Bookmarks property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setBookmarks((current) => [...current as BasePostDataType[], ...data.bookmarks as BasePostDataType[]]);
                        setBookmarksCursor(data.cursor);
                        setBookmarksEndReached(data.end);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setBookmarksCursor(null);
                        setBookmarksEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                };
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
            {bookmarks === undefined
                ? <div>Something went wrong</div>
                : bookmarks === null
                    ? <div>loading...</div>
                    : bookmarks.length === 0
                        ? <div>No bookmarks</div>
                        : bookmarks.map((post) => (
                            <div key={post.id}>

                                {'replyTo' in post && post.replyTo
                                    ? (
                                        <>
                                            <BookmarkReply post={post} />
                                            <div className='feed-hr-line'></div>
                                        </>
                                    )
                                    : (
                                        <>
                                            <FeedPost post={post} />
                                            <div className='feed-hr-line'></div>
                                        </>
                                    )
                                }

                            </div>
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
