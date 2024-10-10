'use client';
import { PostType } from "@/lib/types";
import { useEffect, useState } from "react";
import FeedPost from "./FeedPost";

export default function FeedContent() {
    const [feedPosts, setFeedPosts] = useState<PostType[] | undefined | null>(undefined);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts/feed/global', {
                    method: 'GET',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.log(errorData);

                    throw new Error(errorData.error);
                }

                const feedData: PostType[] = await response.json();
                console.log(feedData);

                setFeedPosts(feedData);
            } catch (error) {

            }
        }

        fetchPosts();
    }, []);

    if (feedPosts === undefined) return <div>loading...</div>;
    if (feedPosts === null) return <div>No posts</div>;

    return (
        <section className='feed-posts-desktop'>
            {feedPosts.map((post) => {
                return (
                    <div key={post.id}>
                        <FeedPost post={post} />
                        <div className="feed-hr-line"></div>
                    </div>
                )
            })}
        </section>
    )
}
