'use client';
import React, { createContext, useContext, useState } from 'react';

type InteractedPostType = {
    postId: number,
    type: 'REPOST' | 'LIKE' | 'BOOKMARK'
    action: 'ADD' | 'REMOVE'
};

interface PostInteractionContextType {
    interactedPost: InteractedPostType | undefined;
    setInteractedPost: React.Dispatch<React.SetStateAction<InteractedPostType | undefined>>,
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
    const [interactedPost, setInteractedPost] = useState<InteractedPostType | undefined>(undefined);

    return (
        <PostInteractionContext.Provider value={{ interactedPost, setInteractedPost }}>
            {children}
        </PostInteractionContext.Provider>
    )
}

export { PostInteractionContext };
