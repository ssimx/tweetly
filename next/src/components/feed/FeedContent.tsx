'use client';
import { useEffect, useRef, useState } from "react";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";
import { socket } from '@/lib/socket';
import { useUserContext } from "@/context/UserContextProvider";
import FeedTab from "./FeedTab";
import { useInView } from "react-intersection-observer";
import { getHomeFollowingFeed, getHomeGlobalFeed, getMorePostsForHomeFollowingFeed, getMorePostsForHomeGlobalFeed } from "@/actions/get-actions";
import { BasePostDataType, ErrorResponse, SuccessResponse } from 'tweetly-shared';
import ClipLoader from 'react-spinners/ClipLoader';
import { Rss } from 'lucide-react';

export default function FeedContent() {
    const [activeTab, setActiveTab] = useState(0);
    const [globalPosts, setGlobalPosts] = useState<BasePostDataType[] | undefined | null>(undefined);
    const [newGlobalPosts, setNewGlobalPosts] = useState<BasePostDataType[]>([]);
    const [followingPosts, setFollowingPosts] = useState<BasePostDataType[] | undefined | null>(undefined);
    const [newFollowingPosts, setNewFollowingPosts] = useState<BasePostDataType[]>([]);
    const [newGlobalPostCount, setNewGlobalPostCount] = useState(0);
    const [newFollowingPostCount, setNewFollowingPostCount] = useState(0);
    const { loggedInUser, newFollowing, setNewFollowing } = useUserContext();

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [globalFeedCursor, setGlobalFeedCursor] = useState<number | null | undefined>(undefined);
    const [globalFeedEndReached, setGlobalFeedEndReached] = useState<boolean | undefined>(undefined);
    const [followingFeedCursor, setFollowingFeedCursor] = useState<number | null | undefined>(undefined);
    const [followingFeedEndReached, setFollowingFeedEndReached] = useState<boolean | undefined>(undefined);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

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
        if (activeTab === 0 && !globalPosts) {
            const fetchGlobalPosts = async () => {
                try {
                    console.log('test fetching global');
                    const response = await getHomeGlobalFeed();

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                    if (data === undefined) throw new Error('Data is missing in response');
                    else if (data.posts === undefined) throw new Error('Posts property is missing in data response');

                    setGlobalFeedEndReached(data.end ?? true);
                    setGlobalFeedCursor(data.posts.length ? data.posts.slice(-1)[0].id : null);
                    setGlobalPosts(data.posts);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setGlobalFeedEndReached(true);
                    setGlobalFeedCursor(null);
                    setGlobalPosts(undefined);
                } finally {
                    setScrollPosition(scrollPositionRef.current);
                }
            }

            fetchGlobalPosts();
        } else if (activeTab === 1 && (!followingPosts || newFollowing === true)) {
            const fetchFollowingPosts = async () => {
                try {
                    console.log('test fetching following');

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

            fetchFollowingPosts();
        }
    }, [activeTab, globalPosts, followingPosts, newFollowing, setNewFollowing]);

    // Add posts received from websockets if user has chosen to show new posts
    const showNewPosts = (type: 'GLOBAL' | 'FOLLOWING') => {
        if (type === 'GLOBAL') {
            setNewGlobalPostCount(0);
            setGlobalPosts((currentPosts) => [...newGlobalPosts, ...currentPosts ?? []]);
            setNewGlobalPosts([]);
        } else if (type === 'FOLLOWING') {
            setNewFollowingPostCount(0);
            setFollowingPosts((currentPosts) => [...newFollowingPosts, ...currentPosts!]);
            setNewFollowingPosts([]);
        } else return;
    };

    useEffect(() => {
        socket.connect();
        // After connecting, tell the server which users this user is following
        socket.emit('get_following', loggedInUser.id);

        // Listen for new posts
        socket.on('new_following_post', (newPost: BasePostDataType) => {
            // Following posts have to already be fetched and saved in order to add new ones to the array
            // If following posts are undefined aka user never clicked on the Following tab, there's no point in saving these posts
            //      as they'll be included in the fetch
            if (followingPosts !== null) {
                setNewFollowingPostCount(currentPostCount => currentPostCount + 1);
                setNewFollowingPosts((currentPosts) => [newPost, ...currentPosts!]);
            }
        });

        socket.on('new_global_post', (newPost: BasePostDataType) => {
            // Unlike following tab, global tab is always preloaded and should always keep track of new posts
            setNewGlobalPostCount(currentPostCount => currentPostCount + 1);
            setNewGlobalPosts((currentPosts) => [newPost, ...currentPosts ?? []]);
        });

        return () => {
            socket.off('new_global_post');
            socket.off('new_following_post');
            socket.disconnect();
        };
    }, [loggedInUser, globalPosts, followingPosts]);

    return (
        <>
            <section className='w-full flex flex-col'>
                <FeedHeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <NewPost />
                {activeTab === 0
                    ? newGlobalPostCount !== 0 && (
                        <>
                            <button onClick={() => showNewPosts('GLOBAL')} className='text-primary py-3 hover:bg-post-hover'>
                                {newGlobalPostCount > 1 ? `Show ${newGlobalPostCount} posts` : 'Show new post'}
                            </button>
                            <div className='feed-hr-line'></div>
                        </>
                    )
                    : newFollowingPostCount !== 0 && (
                        <>
                            <button onClick={() => showNewPosts('FOLLOWING')} className='text-primary py-3 hover:bg-post-hover'>
                                {newFollowingPostCount > 1 ? `Show ${newFollowingPostCount} posts` : 'Show new post'}
                            </button>
                            <div className='feed-hr-line'></div>
                        </>
                    )
                }
            </section>

            <section className='min-w-[400px] flex flex-col h-fit'>
                {activeTab === 0
                    ? globalPosts === undefined
                        ? (
                            <div className='w-full flex justify-center mt-6'>
                                <ClipLoader
                                    className='loading-spinner'
                                    loading={true}
                                    size={25}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        )
                        : globalPosts === null
                            ? (
                                <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                    <p className='text-secondary-text'>Something went wrong.</p>
                                    <button
                                        className='w-fit bg-primary text-white-1 hover:bg-primary-dark border border-primary-border font-bold rounded-[25px] px-4 py-2 text-14'
                                        onClick={() => setGlobalPosts(undefined)}
                                    >
                                        Reload
                                    </button>
                                </div>
                            )
                            : globalPosts.length === 0
                                ? (
                                    <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                        <div className='w-fit h-fit p-5 rounded-full bg-secondary-foreground'>
                                            <Rss size={28} className='text-primary' />
                                        </div>
                                        <p className='text-secondary-text'>No recent posts.</p>
                                    </div>
                                )
                                : <FeedTab
                                    posts={globalPosts}
                                    loadingRef={ref}
                                    scrollPositionRef={scrollPositionRef}
                                    endReached={globalFeedEndReached as boolean} />
                    : null
                }

                {activeTab === 1
                    ? followingPosts === undefined
                        ? (
                            <div className='w-full flex justify-center mt-6'>
                                <ClipLoader
                                    className='loading-spinner'
                                    loading={true}
                                    size={25}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        )
                        : followingPosts === null
                            ? (
                                <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                    <p className='text-secondary-text'>Something went wrong.</p>
                                    <button
                                        className='w-fit bg-primary text-white-1 hover:bg-primary-dark border border-primary-border font-bold rounded-[25px] px-4 py-2 text-14'
                                        onClick={() => setFollowingPosts(undefined)}
                                    >
                                        Reload
                                    </button>
                                </div>
                            )
                            : followingPosts.length === 0
                                ? (
                                    <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                        <div className='w-fit h-fit p-5 rounded-full bg-secondary-foreground'>
                                            <Rss size={28} className='text-primary' />
                                        </div>
                                        <p className='text-secondary-text'>No recent posts, follow more people.</p>
                                    </div>
                                )
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
