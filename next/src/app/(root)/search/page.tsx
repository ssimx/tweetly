'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { searchSchema } from '@/lib/schemas';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useInView } from 'react-intersection-observer';
import { BasicPostType, SearchInfoType } from '@/lib/types';
import { getMoreSearchPosts, getSearchUsersAndPosts } from '@/actions/get-actions';
import PostCard from '@/components/posts/PostCard';
import UserCard from '@/components/misc/UserCard';

export default function Search() {
    const [users, setUsers] = useState<Pick<SearchInfoType, 'users'>['users'] | undefined | null>(undefined);
    const [posts, setPosts] = useState<Pick<SearchInfoType, 'posts'>['posts'] | undefined | null>(undefined);
    const [searchSegments, setSearchSegments] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const search = searchParams.get('q');
    const router = useRouter();

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [postCursor, setPostCursor] = useState<number | null | undefined>(undefined);
    const [endReached, setEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && !endReached && postCursor && scrollPositionRef.current !== scrollPosition) {
            if (!search) return router.push('http://localhost:3000/explore');

            const fetchMorePosts = async () => {
                // Decode query before validation
                const decodedSearch = decodeURIComponent(search);
                searchSchema.parse({ q: decodedSearch });

                // Encode query for API requests
                const encodedSearch = encodeURIComponent(decodedSearch);

                const { posts, end } = await getMoreSearchPosts(encodedSearch, postCursor);
                if (!posts) {
                    setEndReached(true);
                } else {
                    setPostCursor(posts.length !== 0 ? posts.slice(-1)[0].id : null);
                    setPosts(current => [...current as BasicPostType[], ...posts as BasicPostType[]]);
                    setEndReached(end);
                }

                setScrollPosition(scrollPositionRef.current);
            };

            fetchMorePosts();
        }
    }, [inView, postCursor, endReached, scrollPosition, search, router]);

    // Initial data fetch, save cursor
    useEffect(() => {
        if (!search) return router.push('http://localhost:3000/explore');

        const fetchData = async () => {
            try {
                // Decode query before validation
                const decodedSearch = decodeURIComponent(search);
                searchSchema.parse({ q: decodedSearch });

                // Encode query for API requests
                const encodedSearch = encodeURIComponent(decodedSearch);

                const { users, posts, end, searchSegments } = await getSearchUsersAndPosts(encodedSearch);

                setUsers(users);
                setPosts(posts);
                setPostCursor(posts?.length ? posts.slice(-1)[0].id : null);
                setSearchSegments(searchSegments ?? []);
                setEndReached(end);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    router.push('http://localhost:3000/');
                }
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
    }, [search, router]);

    if (users === undefined || posts === undefined) return <div>loading...</div>

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            <div className=''>
                {users === null
                    ? <div>Something went wrong</div>
                    : users.length && (
                        <div className='px-4 pb-4 pt-2'>
                            <h1 className='text-24 font-bold mb-2'>People</h1>
                            <div>
                                {users.slice(0, 3).map((user) => (
                                    <UserCard key={user.username} user={user} />
                                ))}
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className='w-full text-primary text-start hover:font-semibold disabled:text-secondary/50  disabled:hover:font-normal disabled:pointer-events-none' disabled={users.length < 4}>Show more</button>
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
                }

                <div className='feed-hr-line'></div>

                {posts === null
                    ? <div>Something went wrong</div>
                    : posts.length && (
                        posts.map((post, index) => {
                            return (
                                <div key={post.id}>
                                    <PostCard post={post} searchSegments={searchSegments} />
                                    {(index + 1) !== posts.length && <div className='feed-hr-line'></div>}
                                </div>
                            )
                        }))
                }

                {!endReached && (
                    <div ref={ref}>
                        <p>Loading...</p>
                    </div>
                )}
            </div>
        </section>
    )
}
