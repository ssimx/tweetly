'use client';
import { PostType } from "@/lib/types";
import { useEffect, useState } from "react";
import FeedPost from "./FeedPost";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";
import { socket } from '@/lib/socket';
import { useUserContext } from "@/context/UserContextProvider";

export default function FeedContent() {
    const [activeTab, setActiveTab] = useState(0);
    const [followingPosts, setFollowingPosts] = useState<PostType[] | undefined>(undefined);
    const [globalPosts, setGlobalPosts] = useState<PostType[] | undefined>(undefined);
    const [newGlobalPostCount, setNewGlobalPostCount] = useState(0);
    const [newFollowingPostCount, setNewFollowingPostCount] = useState(0);
    const { loggedInUser } = useUserContext();

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
                    } catch (error) {

                    }
                }
            }

            fetchFeedPosts();
        }
    }, [activeTab, globalPosts, followingPosts]);

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
                    ? globalPosts
                        ? globalPosts.map((post, index) => (
                            <div key={index}>
                                <FeedPost post={post} />
                                <div className='feed-hr-line'></div>
                            </div>
                        ))
                        : <div>loading...</div>
                    : null
                }

                {activeTab === 1
                    ? followingPosts === undefined
                        ? <div>loading...</div>
                        : followingPosts.length === 0
                            ? <div>No posts. Follow more people</div>
                            : followingPosts.map((post, index) => (
                                <div key={index}>
                                    <FeedPost post={post} />
                                    <div className='feed-hr-line'></div>
                                </div>
                            ))
                    : null
                }
            </section>
        </>
    )
}
