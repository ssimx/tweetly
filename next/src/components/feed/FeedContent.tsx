'use client';
import { BasicPostType } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";
import { socket } from '@/lib/socket';
import { useUserContext } from "@/context/UserContextProvider";
import FeedTab from "./FeedTab";
import { useInView } from "react-intersection-observer";
import { getHomeFollowingFeed, getMorePostsForHomeFollowingFeed, getMorePostsForHomeGlobalFeed, getNewPostsForHomeGlobalFeed } from "@/actions/get-actions";

export default function FeedContent({ initialPosts }: { initialPosts: { posts: BasicPostType[], end: boolean } | undefined }) {
    const [activeTab, setActiveTab] = useState(0);
    const [globalPosts, setGlobalPosts] = useState<BasicPostType[] | undefined>(initialPosts ? initialPosts.posts : undefined);
    const [followingPosts, setFollowingPosts] = useState<BasicPostType[] | undefined | null>(null);
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

    // reset
    const fetchNewPosts = async () => {
        if (activeTab === 0) {
            setNewGlobalPostCount(0);

            const { posts } = await getNewPostsForHomeGlobalFeed(globalPosts && globalPosts[0].id);
            if (!posts) return;

            setGlobalPosts((currentPosts) => currentPosts ? [...posts, ...currentPosts] : [...posts]);
        } else {
            setNewFollowingPostCount(0);

            const { posts } = await getNewPostsForHomeGlobalFeed(globalPosts && globalPosts[0].id);
            if (!posts) return;

            setFollowingPosts((currentPosts) => currentPosts ? [...posts, ...currentPosts] : [...posts]);
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
                    const { posts, end } = await getMorePostsForHomeGlobalFeed(globalFeedCursor);
                    if (!posts) return;

                    setGlobalPosts(currentPosts => [...currentPosts as BasicPostType[], ...posts as BasicPostType[]]);
                    setGlobalFeedCursor(posts?.length ? posts.slice(-1)[0].id : null);
                    setScrollPosition(scrollPositionRef.current);
                    setGlobalFeedEndReached(end);
                } else if (activeTab === 1 && !followingFeedEndReached && followingFeedCursor) {
                    const { posts, end } = await getMorePostsForHomeFollowingFeed(followingFeedCursor);
                    if (!posts) return;

                    setFollowingPosts(currentPosts => [...currentPosts as BasicPostType[], ...posts as BasicPostType[]]);
                    setFollowingFeedCursor(posts?.length ? posts.slice(-1)[0].id : null);
                    setScrollPosition(scrollPositionRef.current);
                    setFollowingFeedEndReached(end);
                }
            };

            fetchOldPosts();
        }
    }, [inView, activeTab, globalFeedCursor, followingFeedCursor, globalFeedEndReached, followingFeedEndReached, scrollPosition]);

    useEffect(() => {
        // for fetching following tab, check for active tab AND whether followingPosts has yet been fetched OR logged in user has followed new user
        if (activeTab === 1 && (followingPosts === null || newFollowing === true)) {
            const fetchFeedPosts = async () => {
                const { posts, end } = await getHomeFollowingFeed();

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
