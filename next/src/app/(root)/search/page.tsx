'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { searchSchema } from '@/lib/schemas';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useInView } from 'react-intersection-observer';
import { getMorePostsBySearch, getUsersAndPostsBySearch } from '@/actions/get-actions';
import PostCard from '@/components/posts/PostCard';
import UserCard from '@/components/misc/UserCard';
import { AppError, BasePostDataType, ErrorResponse, getErrorMessage, UserDataType } from 'tweetly-shared';

export default function Search() {
    const router = useRouter();
    const pathname = usePathname();

    const searchParams = useSearchParams();
    const searchQuery = (pathname.startsWith('/search') || pathname.startsWith('/explore')) ? searchParams.get('q') : null;

    const [users, setUsers] = useState<UserDataType[] | undefined>(undefined);
    const [posts, setPosts] = useState<BasePostDataType[] | undefined>(undefined);
    const [searchSegments, setSearchSegments] = useState<string[]>([]);
    const [hasFetchError, setHasFetchError] = useState(false);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [postsCursor, setPostsCursor] = useState<number | null | undefined>(undefined);
    const [postsEndReached, setPostsEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && !postsEndReached && postsCursor && scrollPositionRef.current !== scrollPosition) {
            if (!searchQuery) return router.push('http://localhost:3000/explore');

            const fetchMorePosts = async () => {
                try {
                    searchSchema.parse({ q: searchQuery.trim() });
                    const encodedSearch = encodeURIComponent(searchQuery.trim());

                    const response = await getMorePostsBySearch(encodedSearch, postsCursor);

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response;
                    if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                    else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');
                    else if (data.cursor === undefined) throw new AppError('Posts cursor property is missing in data response', 404, 'MISSING_PROPERTY');

                    setPosts((current) => [...current as BasePostDataType[], ...data.posts as BasePostDataType[]]);
                    setPostsCursor(data.cursor);
                    setPostsEndReached(data.end ?? true);
                } catch (error: unknown) {
                    const errorMessage = getErrorMessage(error);
                    console.error(errorMessage);
                    setPostsCursor(null);
                    setPostsEndReached(true);
                } finally {
                    setScrollPosition(scrollPositionRef.current);
                }
            };

            fetchMorePosts();
        }
    }, [inView, postsCursor, postsEndReached, scrollPosition, searchQuery, router]);

    // Initial data fetch, save cursor
    useEffect(() => {
        if (!searchQuery) return router.push('http://localhost:3000/explore');

        const fetchData = async () => {
            try {
                searchSchema.parse({ q: searchQuery.trim() });
                const encodedSearch = encodeURIComponent(searchQuery.trim());

                const response = await getUsersAndPostsBySearch(encodedSearch);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response;
                if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                else if (data.users === undefined) throw new AppError('Users property is missing in data response', 404, 'MISSING_PROPERTY');
                else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');
                else if (data.postsCursor === undefined) throw new AppError('Posts cursor property is missing in data response', 404, 'MISSING_PROPERTY');
                else if (data.queryParams === undefined) throw new AppError('Query params property is missing in data response', 404, 'MISSING_PROPERTY');;

                setUsers(data.users);
                setPosts(data.posts);
                setPostsCursor(data.postsCursor);
                setPostsEndReached(data.postsEnd);
                setSearchSegments(data.queryParams.segments);
            } catch (error: unknown) {
                console.error("Something went wrong:", error);

                setHasFetchError(true);
                setUsers([]);
                setPosts([]);

                setPostsEndReached(true);
                setPostsCursor(null);
            } finally {
                setScrollPosition(scrollPositionRef.current);
            }
        };

        fetchData();
        setScrollPosition(scrollPositionRef.current);

        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [searchQuery, router]);

    if (users === undefined || posts === undefined) return <div>loading...</div>

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            <div className=''>
                {users === undefined
                    ? <div>loading...</div>
                    : users && users.length
                        ? (
                            <div className='px-4 pb-4 pt-2'>
                                <h1 className='text-24 font-bold mb-2'>People</h1>
                                <div>
                                    {users.slice(0, 3).map((user) => (
                                        <UserCard key={user.username} user={user} />
                                    ))}
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button
                                            className='w-full text-primary text-start hover:font-semibold disabled:cursor-not-allowed disabled:text-secondary/50 disabled:hover:font-normal'
                                            disabled={users.length < 4}>Show more</button>
                                    </DialogTrigger>
                                    {
                                        users.length > 3 && (
                                            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-hidden">
                                                <DialogHeader className='mb-3'>
                                                    <DialogTitle className='text-20 font-bold'>Suggested for you</DialogTitle>
                                                </DialogHeader>
                                                <div className='flex-grow overflow-y-auto max-h-[calc(90vh-100px)]'>
                                                    {
                                                        users === undefined
                                                            ? 'loading'
                                                            : users.map((user) => (
                                                                <UserCard key={user.username} user={user} />
                                                            ))
                                                    }
                                                </div>
                                            </DialogContent>
                                        )
                                    }
                                </Dialog>
                            </div>
                        )
                        : hasFetchError
                            ? <div> Something went wrong</div>
                            : null
                }

                <div className='feed-hr-line'></div>

                {posts === undefined
                    ? <div>loading...</div>
                    : posts && posts.length
                        ? (
                            posts.map((post, index) => {
                                return (
                                    <div key={post.id}>
                                        <PostCard post={post} searchSegments={searchSegments} />
                                        {(index + 1) !== posts.length && <div className='feed-hr-line'></div>}
                                    </div>
                                )
                            })
                        )
                        : hasFetchError
                            ? <div>Something went wrong</div>
                            : null
                }

                {!postsEndReached && (
                    <div ref={ref}>
                        <p>Loading...</p>
                    </div>
                )}
            </div>
        </section>
    )
}
