'use client';
import { PostType } from "@/lib/types";
import { useEffect, useState } from "react";
import FeedPost from "./FeedPost";
import FeedHeaderTabs from "./FeedHeaderTabs";
import NewPost from "./NewPost";

export default function FeedContent() {
    const [activeTab, setActiveTab] = useState(0);
    const [followingPosts, setFollowingPosts] = useState<PostType[] | undefined>(undefined);
    const [globalPosts, setGlobalPosts] = useState<PostType[] | undefined>(undefined);

    useEffect(() => {
        const fetchPosts = async () => {
            if (activeTab === 0) {
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
                    console.log(globalFeed);

                    setGlobalPosts(globalFeed);
                } catch (error) {

                }
            } else {
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
                    console.log(followingFeed);

                    setFollowingPosts(followingFeed);
                } catch (error) {

                }
            }
        }

        fetchPosts();
    }, [activeTab]);

    console.log(followingPosts);
    

    return (
        <>
            <section className='feed-header'>
                <FeedHeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <NewPost />
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
