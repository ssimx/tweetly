'use client';
import React, { createContext, useContext, useState } from 'react';

type InteractedPostType = {
    postId: number,
    repostsCount: number,
    likesCount: number,
    bookmarked: boolean,
};

type InteractedPostsMap = Map<number, InteractedPostType>;

interface PostInteractionContextType {
    interactedPosts: InteractedPostsMap,
    setInteractedPosts: React.Dispatch<React.SetStateAction<InteractedPostsMap>>,
    updateInteractedPosts: ({ postId, repostsCount, likesCount }: InteractedPostType) => void,
};

const PostInteractionContext = createContext<PostInteractionContextType | undefined>(undefined);

export const usePostInteractionContext = () => {
    const context = useContext(PostInteractionContext);
    if (!context) {
        throw new Error('usePostInteractionContext must be used within PostInteractionContextProvider');
    }
    return context;
};

export default function PostInteractionContextProvider({ children}: { children: React.ReactNode }) {
    const [interactedPosts, setInteractedPosts] = useState<InteractedPostsMap>(new Map());
    console.log(interactedPosts)
    const updateInteractedPosts = ({ postId, repostsCount, likesCount, bookmarked }: InteractedPostType) => {
        setInteractedPosts((prev) => {
            const newMap = new Map(prev);

            if (newMap.size === 1000) {
                // Get the last added entry (the newest one)
                const lastKey = Array.from(newMap.keys()).pop();
                if (lastKey) {
                    newMap.set(lastKey, { postId, repostsCount, likesCount, bookmarked });
                }
            } else {
                newMap.set(postId, { postId, repostsCount, likesCount, bookmarked });
            }

            return newMap;
        });
    };



    return (
        <PostInteractionContext.Provider value={{ interactedPosts, setInteractedPosts, updateInteractedPosts }}>
            {children}
        </PostInteractionContext.Provider>
    )
}

export { PostInteractionContext };
