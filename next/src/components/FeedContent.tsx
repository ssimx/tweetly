'use client';

import { useEffect } from "react";

export default function FeedContent() {

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const feedPosts = await fetch('/api/feedposts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

            } catch (error) {

            }
        }
        
        fetchPosts();
    }, []);

    return (
        <div>
            feed
        </div>
    )
}
