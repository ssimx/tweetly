'use client';
import { useEffect, useRef, useState } from "react";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";
import { socket } from '@/lib/socket';
import { useUserContext } from "@/context/UserContextProvider";
import FeedTab from "./FeedTab";
import { useInView } from "react-intersection-observer";
import { getHomeFollowingFeed, getMorePostsForHomeFollowingFeed, getMorePostsForHomeGlobalFeed, getNewPostsForHomeFollowingFeed, getNewPostsForHomeGlobalFeed } from "@/actions/get-actions";
import { BasePostDataType, ErrorResponse, SuccessResponse } from 'tweetly-shared';

export default function FeedContent({ initialPosts }: { initialPosts: { posts: BasePostDataType[], end: boolean } | undefined }) {
    const [activeTab, setActiveTab] = useState(0);
    const [globalPosts, setGlobalPosts] = useState<BasePostDataType[] | undefined>(initialPosts ? initialPosts.posts : undefined);
    const [followingPosts, setFollowingPosts] = useState<BasePostDataType[] | undefined | null>(null);
    const [newGlobalPostCount, setNewGlobalPostCount] = useState(0);
    const [newFollowingPostCount, setNewFollowingPostCount] = useState(0);
    const { loggedInUser, newFollowing, setNewFollowing } = useUserContext();

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [globalFeedCursor, setGlobalFeedCursor] = useState<number | null | undefined>(initialPosts ? initialPosts.posts.length !== 0 ? initialPosts.posts.slice(-1)[0].id : null : undefined);
    const [globalFeedEndReached, setGlobalFeedEndReached] = useState<boolean | undefined>(initialPosts ? initialPosts.end : undefined);
    const [followingFeedCursor, setFollowingFeedCursor] = useState<number | null | undefined>(undefined);
    const [followingFeedEndReached, setFollowingFeedEndReached] = useState<boolean | undefined>(undefined);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // For fetching new posts after websocket signal
    const fetchNewPosts = async () => {
        if (activeTab === 0) {
            setNewGlobalPostCount(0);
            try {
                const response = await getNewPostsForHomeGlobalFeed(globalPosts?.[0].id ?? null);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                if (data === undefined) throw new Error('Data is missing in response');
                else if (data.posts === undefined) throw new Error('Posts property is missing in data response');
                console.log(data)

                if (data.end) setGlobalFeedEndReached(data.end);
                setGlobalFeedCursor(data.posts.length ? data.posts.slice(-1)[0].id : null);
                setGlobalPosts(currentPosts => [ ...data.posts as BasePostDataType[], ...currentPosts as BasePostDataType[] ]);
            } catch (error) {
                console.error("Something went wrong:", error);
            } finally {
                setScrollPosition(scrollPositionRef.current);
            }
        } else {
            setNewFollowingPostCount(0);
            try {
                const response = await getNewPostsForHomeFollowingFeed(followingPosts?.[0].id ?? null);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                if (data === undefined) throw new Error('Data is missing in response');
                else if (data.posts === undefined) throw new Error('Posts property is missing in data response');

                if (data.end) setFollowingFeedEndReached(data.end);
                setFollowingFeedCursor(data.posts.length ? data.posts.slice(-1)[0].id : null);
                setFollowingPosts(currentPosts => [...data.posts as BasePostDataType[], ...currentPosts as BasePostDataType[] ]);
            } catch (error) {
                console.error("Something went wrong:", error);
            } finally {
                setScrollPosition(scrollPositionRef.current);
            }
        }
    };

    // Reset scroll position when switching tabs
    useEffect(() => {
        setScrollPosition(() => 0);
    }, [activeTab]);

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldPosts = async () => {
                if (activeTab === 0 && !globalFeedEndReached && globalFeedCursor) {
                    try {
                        const response = await getMorePostsForHomeGlobalFeed(globalFeedCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                        if (data === undefined) throw new Error('Data is missing in response');
                        else if (data.posts === undefined) throw new Error('Posts property is missing in data response');

                        setGlobalFeedEndReached(data.end ?? true);
                        setGlobalFeedCursor(data.posts.length ? data.posts.slice(-1)[0].id : null);
                        setGlobalPosts(currentPosts => [...currentPosts as BasePostDataType[], ...data.posts as BasePostDataType[]]);
                    } catch (error) {
                        console.error("Something went wrong:", error);

                        setGlobalFeedEndReached(true);
                        setGlobalFeedCursor(null);
                        setGlobalPosts([]);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                } else if (activeTab === 1 && !followingFeedEndReached && followingFeedCursor) {
                    try {
                        const response = await getMorePostsForHomeFollowingFeed(followingFeedCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                        if (data === undefined) throw new Error('Data is missing in response');
                        else if (data.posts === undefined) throw new Error('Posts property is missing in data response');

                        setFollowingFeedEndReached(data.end ?? true);
                        setFollowingFeedCursor(data.posts.length ? data.posts.slice(-1)[0].id : null);
                        setGlobalPosts(currentPosts => [...currentPosts as BasePostDataType[], ...data.posts as BasePostDataType[]]);
                    } catch (error) {
                        console.error("Something went wrong:", error);

                        setFollowingFeedEndReached(true);
                        setFollowingFeedCursor(null);
                        setGlobalPosts([]);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                }
            };

            fetchOldPosts();
        }
    }, [inView, activeTab, globalFeedCursor, followingFeedCursor, globalFeedEndReached, followingFeedEndReached, scrollPosition]);

    useEffect(() => {
        // for fetching following tab, check for active tab AND whether followingPosts has yet been fetched OR logged in user has followed new user
        if (activeTab === 1 && (followingPosts === null || newFollowing === true)) {
            const fetchFeedPosts = async () => {
                try {
                    const response = await getHomeFollowingFeed();

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                    if (data === undefined) throw new Error('Data is missing in response');
                    else if (data.posts === undefined) throw new Error('Posts property is missing in data response');

                    setFollowingFeedEndReached(data.end ?? true);
                    setFollowingFeedCursor(data.posts.length ? data.posts.slice(-1)[0].id : null);
                    setFollowingPosts(data.posts);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setFollowingFeedEndReached(true);
                    setFollowingFeedCursor(null);
                    setFollowingPosts(undefined);
                } finally {
                    setScrollPosition(scrollPositionRef.current);
                }
            }

            fetchFeedPosts();
        }
    }, [activeTab, followingPosts, newFollowing, setNewFollowing]);

    useEffect(() => {
        socket.connect();
        // After connecting, tell the server which users this user is following
        socket.emit('get_following', loggedInUser.id);

        // Listen for new posts
        const onNewGlobalPostEvent = () => {
            setNewGlobalPostCount(currentPostCount => currentPostCount <= 25 ? currentPostCount + 1 : currentPostCount);
        };

        const onNewFollowingPostEvent = () => {
            setNewFollowingPostCount(currentPostCount => currentPostCount <= 25 ? currentPostCount + 1 : currentPostCount);
        };

        socket.on('new_global_post', onNewGlobalPostEvent);
        socket.on('new_following_post', onNewFollowingPostEvent);

        return () => {
            socket.off('new_global_post', onNewGlobalPostEvent);
            socket.off('new_following_post', onNewGlobalPostEvent);
            socket.disconnect();
        };
    }, [loggedInUser, globalPosts, followingPosts]);

    return (
        <>
            <section className='feed-header'>
                <FeedHeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <NewPost />
                {activeTab === 0
                    ? newGlobalPostCount !== 0 && (
                        <>
                            <button onClick={fetchNewPosts} className='text-primary py-3 hover:bg-post-hover'>
                                {newGlobalPostCount > 1 ? `Show ${newGlobalPostCount} posts` : 'Show new post'}
                            </button>
                            <div className='feed-hr-line'></div>
                        </>
                    )
                    : newFollowingPostCount !== 0 && (
                        <>
                            <button onClick={fetchNewPosts} className='text-primary py-3 hover:bg-post-hover'>
                                {newGlobalPostCount > 1 ? `Show ${newGlobalPostCount} posts` : 'Show new post'}
                            </button>
                            <div className='feed-hr-line'></div>
                        </>
                    )
                }
            </section>

            <section className='feed-posts-desktop'>
                {activeTab === 0
                    ? globalPosts === undefined
                        ? <div>Something went wrong</div>
                        : globalPosts === null
                            ? <div>loading...</div>
                            : globalPosts.length === 0
                                ? <div>No recent posts</div>
                                : <FeedTab
                                    posts={globalPosts}
                                    loadingRef={ref}
                                    scrollPositionRef={scrollPositionRef}
                                    endReached={globalFeedEndReached as boolean} />
                    : null
                }

                {activeTab === 1
                    ? followingPosts === undefined
                        ? <div>Something went wrong</div>
                        : followingPosts === null
                            ? <div>loading...</div>
                            : followingPosts.length === 0
                                ? <div>No posts. Follow more people</div>
                                : <FeedTab
                                    posts={followingPosts}
                                    loadingRef={ref}
                                    scrollPositionRef={scrollPositionRef}
                                    endReached={followingFeedEndReached as boolean} />
                    : null
                }
            </section>
        </>
    )
}
