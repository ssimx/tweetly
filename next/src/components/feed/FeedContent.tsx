'use client';
import { BasicPostType } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";
import { socket } from '@/lib/socket';
import { useUserContext } from "@/context/UserContextProvider";
import FeedTab from "./FeedTab";
import { useInView } from "react-intersection-observer";
import { FeedPostsType } from "@/app/(root)/page";
import { getHomeFollowingFeed } from "@/actions/actions";

export default function FeedContent({ initialPosts }: { initialPosts: FeedPostsType | undefined }) {
    const [activeTab, setActiveTab] = useState(0);
    const [globalPosts, setGlobalPosts] = useState<BasicPostType[] | undefined>(initialPosts ? initialPosts.posts : undefined);
    const [followingPosts, setFollowingPosts] = useState<BasicPostType[] | null | undefined>(null);
    const [newGlobalPostCount, setNewGlobalPostCount] = useState(0);
    const [newFollowingPostCount, setNewFollowingPostCount] = useState(0);
    const { loggedInUser, newFollowing, setNewFollowing } = useUserContext();

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [globalFeedCursor, setGlobalFeedCursor] = useState<number | null | undefined>(initialPosts ? initialPosts.posts.length !== 0 ? initialPosts.posts.slice(-1)[0].id : null : undefined);
    const [followingFeedCursor, setFollowingFeedCursor] = useState<number | null | undefined>(null);
    const [globalFeedEndReached, setGlobalFeedEndReached] = useState(false);
    const [followingFeedEndReached, setFollowingFeedEndReached] = useState(false);
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
                if (activeTab === 0 && !globalFeedEndReached) {
                    const response = await fetch(`api/posts/feed/global?cursor=${globalFeedCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache',
                    });
                    const { olderGlobalPosts, end } = await response.json() as { olderGlobalPosts: BasicPostType[], end: boolean };

                    setGlobalFeedCursor(olderGlobalPosts.length !== 0 ? olderGlobalPosts.slice(-1)[0].id : null);
                    setGlobalPosts(currentPosts => [...currentPosts as BasicPostType[], ...olderGlobalPosts]);
                    setScrollPosition(scrollPositionRef.current);
                    setGlobalFeedEndReached(end);
                } else if (activeTab === 1 && !followingFeedEndReached) {
                    const response = await fetch(`api/posts/feed/following?cursor=${followingFeedCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache',
                    });
                    const { olderFollowingPosts, end } = await response.json() as { olderFollowingPosts: BasicPostType[], end: boolean };

                    setFollowingFeedCursor(olderFollowingPosts.length !== 0 ? olderFollowingPosts.slice(-1)[0].id : null);
                    setFollowingPosts(currentPosts => [...currentPosts as BasicPostType[], ...olderFollowingPosts]);
                    setScrollPosition(scrollPositionRef.current);
                    setFollowingFeedEndReached(end);
                }
            };

            fetchOldPosts();
        }
    }, [inView, activeTab, globalFeedCursor, followingFeedCursor, globalFeedEndReached, followingFeedEndReached, scrollPosition]);

    useEffect(() => {
        if (activeTab === 1 && (followingPosts === null || newFollowing === true)) {
            const fetchFeedPosts = async () => {
                const { posts, end } = await getHomeFollowingFeed();
                console.log(posts)

                setFollowingPosts(posts);
                setFollowingFeedCursor(posts ? posts.length !== 0 ? posts.slice(-1)[0].id : null : undefined);
                setFollowingFeedEndReached(end);
                setNewFollowing(false);
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
            socket.disconnect();
        };
    }, [loggedInUser]);

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
                                    endReached={globalFeedEndReached} />
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
                                    endReached={followingFeedEndReached} />
                    : null
                }
            </section>
        </>
    )
}
