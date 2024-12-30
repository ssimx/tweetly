'use client';
import { PostType } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";
import { socket } from '@/lib/socket';
import { useUserContext } from "@/context/UserContextProvider";
import FeedTab from "./FeedTab";
import { useInView } from "react-intersection-observer";

interface FeedType {
    posts: PostType[],
    end: boolean,
}

export default function FeedContent() {
    const [activeTab, setActiveTab] = useState(0);
    const [globalPosts, setGlobalPosts] = useState<PostType[] | undefined>(undefined);
    const [followingPosts, setFollowingPosts] = useState<PostType[] | undefined>(undefined);
    const [newGlobalPostCount, setNewGlobalPostCount] = useState(0);
    const [newFollowingPostCount, setNewFollowingPostCount] = useState(0);
    const { loggedInUser } = useUserContext();

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [globalFeedCursor, setGlobalFeedCursor] = useState<number | null>(null);
    const [followingFeedCursor, setFollowingFeedCursor] = useState<number | null>(null);
    const [globalFeedEndReached, setGlobalFeedEndReached] = useState(false);
    const [followingFeedEndReached, setFollowingFeedEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldMsgs = async () => {
                if (activeTab === 0 && !globalFeedEndReached) {
                    const response = await fetch(`api/posts/feed/global?cursor=${globalFeedCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache',
                    });
                    const { olderGlobalPosts, end }: { olderGlobalPosts: PostType[], end: boolean } = await response.json();

                    setGlobalFeedCursor(olderGlobalPosts.length !== 0 ? olderGlobalPosts.slice(-1)[0].id : null);
                    setGlobalPosts(currentPosts => [...currentPosts as PostType[], ...olderGlobalPosts]);
                    setScrollPosition(scrollPositionRef.current);

                    if (olderGlobalPosts.length === 0 || end === true) {
                        setGlobalFeedEndReached(true);
                    }
                } else if (activeTab === 1 && !followingFeedEndReached) {
                    const response = await fetch(`api/posts/feed/following?cursor=${followingFeedCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache',
                    });
                    const { olderFollowingPosts, end }: { olderFollowingPosts: PostType[], end: boolean } = await response.json();
                    console.log(olderFollowingPosts, end);

                    setFollowingFeedCursor(olderFollowingPosts.length !== 0 ? olderFollowingPosts.slice(-1)[0].id : null);
                    setFollowingPosts(currentPosts => [...currentPosts as PostType[], ...olderFollowingPosts]);
                    setScrollPosition(scrollPositionRef.current);

                    if (olderFollowingPosts.length === 0 || end === true) {
                        setFollowingFeedEndReached(true);
                    }
                }
            };

            fetchOldMsgs();
        }
    }, [inView, activeTab, globalFeedCursor, followingFeedCursor, globalFeedEndReached, followingFeedEndReached, scrollPosition]);

    // Initial data fetch, save cursor
    useEffect(() => {
        if (activeTab === 0) {
            const fetchFeedPosts = async () => {
                if (globalPosts === undefined) {
                    try {
                        const response = await fetch('/api/posts/feed/global', {
                            method: 'GET',
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error);
                        }

                        const results = await response.json() as FeedType;
                        
                        setGlobalPosts([...results.posts]);
                        setGlobalFeedCursor(results.posts.length !== 0 ? results.posts.slice(-1)[0].id : null);

                        if (results.posts.length === 0 || results.end === true) {
                            setGlobalFeedEndReached(() => true);
                        }
                    } catch (error) {

                    }
                }
            };

            fetchFeedPosts();
        } else {
            const fetchFeedPosts = async () => {
                if (followingPosts === undefined) {
                    try {
                        const response = await fetch('/api/posts/feed/following', {
                            method: 'GET',
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error);
                        }

                        const results = await response.json() as FeedType;

                        setFollowingPosts([...results.posts] as PostType[]);
                        setFollowingFeedCursor(results.posts.length !== 0 ? results.posts.slice(-1)[0].id : null);

                        if (results.posts.length === 0 || results.end === true) {
                            setFollowingFeedEndReached(() => true);
                        }
                    } catch (error) {

                    }
                }
            }

            fetchFeedPosts();
        }
    }, [activeTab, globalPosts, followingPosts]);

    // Reset scroll position when switching tabs
    useEffect(() => {
        setScrollPosition(() => 0);
    }, [activeTab]);

    useEffect(() => {
        socket.connect();

        // After connecting, tell the server which users this user is following
        socket.emit('get_following', loggedInUser.id);

        return () => {
            socket.disconnect();
        };
    }, [loggedInUser]);

    useEffect(() => {
        const onNewGlobalPostEvent = () => {
            setNewGlobalPostCount(currentPostCount => currentPostCount + 1);
        };

        const onNewFollowingPostEvent = () => {
            setNewFollowingPostCount(currentPostCount => currentPostCount + 1);
        };

        socket.on('new_global_post', onNewGlobalPostEvent);
        socket.on('new_following_post', onNewFollowingPostEvent);

        return () => {
            socket.off('new_global_post', onNewGlobalPostEvent);
            socket.off('new_following_post', onNewGlobalPostEvent);
        };
    }), [];

    const fetchNewPosts = () => {
        if (activeTab === 0) {
            setGlobalPosts(undefined);
            setNewGlobalPostCount(0);
        } else {
            setFollowingPosts(undefined);
            setNewFollowingPostCount(0);
        }
    };

    return (
        <>
            <section className='feed-header'>
                <FeedHeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <NewPost />
                { activeTab === 0
                    ? newGlobalPostCount !== 0 && (
                        <>
                            <button onClick={fetchNewPosts} className='text-primary py-3 hover:bg-card-hover'>
                                {newGlobalPostCount > 1 ? `Show ${newGlobalPostCount} posts` : 'Show new post'}
                            </button>
                            <div className='feed-hr-line'></div>
                        </>
                    )
                    : newFollowingPostCount !== 0 && (
                        <>
                            <button onClick={fetchNewPosts} className='text-primary py-3 hover:bg-card-hover'>
                                {newGlobalPostCount > 1 ? `Show ${newGlobalPostCount} posts` : 'Show new post'}
                            </button>
                            <div className='feed-hr-line'></div>
                        </>
                    )
                }
            </section>

            <section className='feed-posts-desktop'>
                {activeTab === 0
                    && globalPosts && globalPosts.length === 0
                        ? <div>No recent posts</div>
                        : globalPosts === undefined
                            ? <div>loading...</div>
                            : <FeedTab 
                                posts={globalPosts as PostType[]}
                                loadingRef={ref}
                                scrollPositionRef={scrollPositionRef}
                                endReached={globalFeedEndReached} />
                }

                {activeTab === 1
                    ? followingPosts === undefined
                        ? <div>loading...</div>
                        : followingPosts.length === 0
                            ? <div>No posts. Follow more people</div>
                            : <FeedTab
                                posts={followingPosts as PostType[]}
                                loadingRef={ref}
                                scrollPositionRef={scrollPositionRef}
                                endReached={followingFeedEndReached} />
                    : null
                }
            </section>
        </>
    )
}
