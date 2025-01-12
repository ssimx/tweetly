'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { searchSchema } from '@/lib/schemas';
import { z } from 'zod';
import ProfileFollowersFollowingCard from '@/components/profile/ProfileFollowersFollowingCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PostType } from '@/lib/types';
import { useInView } from 'react-intersection-observer';
import FeedTab from '@/components/feed/FeedTab';

interface SearchType {
    users: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        blockedBy: {
            blockerId: number,
        }[] | [],
        blockedUsers: {
            blockedId: number,
        }[] | [],
        notifying: {
            receiverId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        },
    }[],
    posts: PostType[],
    queryParams: {
        raw: string,
        segments: string[],
        stringSegments: string[],
        usernames: string[],
        hashtags: string[],
    },
    end: boolean,
};

export type UsersType = SearchType['users'];
type PostsType = SearchType['posts'];

export default function Search() {
    const [users, setUsers] = useState<UsersType>([]);
    const [posts, setPosts] = useState<PostsType>([]);
    const searchParams = useSearchParams();
    const search = searchParams.get('q');
    const router = useRouter();

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [postCursor, setPostCursor] = useState<number>();
    const [endReached, setEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && !endReached && scrollPositionRef.current !== scrollPosition) {
            const fetchMorePosts = async () => {
                const response = await fetch(`api/search/posts?q=${search}&cursor=${postCursor}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache',
                });
                const { posts, end }: { posts: PostType[], end: boolean } = await response.json();

                if (posts.length === 0 || end === true) {
                    setEndReached(() => true);
                    return;
                }

                setPostCursor(posts.length > 0 ? posts[posts.length - 1].id : 0);
                setPosts(currentPosts => [...currentPosts as PostType[], ...posts]);
                setScrollPosition(scrollPositionRef.current);
            };

            fetchMorePosts();
        }
    }, [inView, postCursor, endReached, scrollPosition, search]);

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

                const searchResults = await fetch(`/api/search?q=${encodedSearch}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const searchData = await searchResults.json() as SearchType;

                if (searchData.users.length !== 0) {
                    // Prioritize user results by match specificity
                    const prioritizedUsers = searchData.users.map((user) => {
                        const { username, profile } = user;
                        const name = profile?.name || "";
                        let priority = 0;

                        searchData.queryParams.usernames.forEach((term) => {
                            if (username.toLowerCase() === term.toLowerCase()) {
                                priority += 3; // Exact match to username
                            } else if (username.toLowerCase().startsWith(term.toLowerCase())) {
                                priority += 2; // Starts with username
                            } else if (username.toLowerCase().includes(term.toLowerCase())) {
                                priority += 1; // Partial match to username
                            }

                            if (name.toLowerCase() === term.toLowerCase()) {
                                priority += 3; // Exact match to name
                            } else if (name.toLowerCase().startsWith(term.toLowerCase())) {
                                priority += 2; // Starts with name
                            } else if (name.toLowerCase().includes(term.toLowerCase())) {
                                priority += 1; // Partial match to name
                            }
                        });

                        return { ...user, priority };

                    });

                    // Sort by priority in descending order
                    searchData.users = prioritizedUsers.sort((a, b) => b.priority - a.priority);
                    setUsers([...searchData.users]);
                };

                setPosts([...searchData.posts]);
                setPostCursor(searchData.posts.length > 0 ? searchData.posts[searchData.posts.length - 1].id : 0);

                if (searchData.posts.length === 0 || searchData.end === true) {
                    setEndReached(() => true);
                    return;
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    router.push('http://localhost:3000/');
                }
            }
        };

        fetchData();
    }, [search, router]);
    
    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            <div className=''>
                { users.length !== 0 && (
                        <div className='px-4 pb-4 pt-2'>
                            <h1 className='text-24 font-bold mb-2'>People</h1>
                            <div>
                                {users.slice(0, 3).map((user, index) => (
                                    <ProfileFollowersFollowingCard key={index} user={user} />
                                ))}
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className='w-full text-primary text-start hover:font-semibold disabled:text-primary/50 disabled:hover:font-normal disabled:pointer-events-none' disabled={users.length < 4}>Show more</button>
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
                                                        : users.map((user, index) => (
                                                            <ProfileFollowersFollowingCard key={index} user={user} />
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
                <div className=''>
                    <FeedTab
                        posts={posts as PostType[]}
                        searchSegments={search ? search.split(' ') : undefined}
                        loadingRef={ref}
                        scrollPositionRef={scrollPositionRef}
                        endReached={endReached} />
                </div>
            </div>
        </section>
    )
}
