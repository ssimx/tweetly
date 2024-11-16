'use client';
import { PostType } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";
import { socket } from '@/lib/socket';
import { useUserContext } from "@/context/UserContextProvider";
import FeedTab from "./FeedTab";
import { useInView } from "react-intersection-observer";

export default function FeedContent() {
    const [activeTab, setActiveTab] = useState(0);
    const [followingPosts, setFollowingPosts] = useState<PostType[] | undefined>(undefined);
    const [globalPosts, setGlobalPosts] = useState<PostType[] | undefined>(undefined);
    const [newGlobalPostCount, setNewGlobalPostCount] = useState(0);
    const [newFollowingPostCount, setNewFollowingPostCount] = useState(0);
    const { loggedInUser } = useUserContext();

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [globalFeedCursor, setGlobalFeedCursor] = useState<number>();
    const [followingFeedCursor, setFollowingFeedCursor] = useState<number>();
    const [endReached, setEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older messages when inView is true
    useEffect(() => {
        if (inView && !endReached && scrollPositionRef.current !== scrollPosition) {
            const fetchOldMsgs = async () => {
                if (activeTab === 0) {
                    const response = await fetch(`api/posts/feed/global?cursor=${globalFeedCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache',
                    });
                    const { olderGlobalPosts, end }: { olderGlobalPosts: PostType[], end: boolean } = await response.json();

                    if (olderGlobalPosts.length === 0 && end === true) {
                        setEndReached(true);
                        return;
                    }

                    setGlobalFeedCursor(olderGlobalPosts[olderGlobalPosts.length === 0 ? 0 : olderGlobalPosts.length - 1].id);
                    setGlobalPosts(currentPosts => [...currentPosts as PostType[], ...olderGlobalPosts]);
                    setScrollPosition(scrollPositionRef.current);
                } else {
                    const response = await fetch(`api/posts/feed/following?cursor=${followingFeedCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache',
                    });
                    const { olderFollowingPosts, end }: { olderFollowingPosts: PostType[], end: boolean } = await response.json();

                    console.log(olderFollowingPosts);
                    

                    if (olderFollowingPosts.length === 0 && end === true) {
                        setEndReached(true);
                        return;
                    }

                    setFollowingFeedCursor(olderFollowingPosts.length > 0 ? olderFollowingPosts[olderFollowingPosts.length - 1].id : 0);
                    setFollowingPosts(currentPosts => [...currentPosts as PostType[], ...olderFollowingPosts]);
                    setScrollPosition(scrollPositionRef.current);
                }
            };

            fetchOldMsgs();
        }
    }, [inView, activeTab, globalFeedCursor, followingFeedCursor, endReached, scrollPosition]);

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
                            console.log(errorData);

                            throw new Error(errorData.error);
                        }

                        const globalFeed: PostType[] = await response.json();
                        setGlobalPosts(globalFeed);
                        setGlobalFeedCursor(globalFeed.length > 0 ? globalFeed[globalFeed.length - 1].id : 0);
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
                            console.log(errorData);

                            throw new Error(errorData.error);
                        }

                        const followingFeed: PostType[] = await response.json();
                        setFollowingPosts(followingFeed);
                        setFollowingFeedCursor(followingFeed.length > 0 ? followingFeed[followingFeed.length - 1].id : 0)
                    } catch (error) {

                    }
                }
            }

            fetchFeedPosts();
        }
    }, [activeTab, globalPosts, followingPosts]);

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

    if (globalPosts === undefined) return <div>loading...</div>

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
                    ? <FeedTab 
                        posts={globalPosts as PostType[]}
                        loadingRef={ref}
                        scrollPositionRef={scrollPositionRef}
                        endReached={endReached} />
                    : null
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
                                endReached={endReached} />
                    : null
                }
            </section>
        </>
    )
}
