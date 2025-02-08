'use server';
import { getCurrentUserToken } from "@/data-acess-layer/auth";
import { newPostSchema } from "@/lib/schemas";
import { NewPostType } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { redirect } from 'next/navigation';

export async function followUser(username: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/users/follow/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function unfollowUser(username: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/users/removeFollow/${username}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function createPost(data: unknown) {
    const token = await getCurrentUserToken();

    try {
        const validatedData = newPostSchema.parse(data);
        const response = await fetch('http://localhost:3000/api/posts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(validatedData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        const postData = await response.json() as NewPostType;
        return postData;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        redirect(`http://localhost:3000/`);
    }
};

export async function repostPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/repost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeRepostPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeRepost/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function likePost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/like/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeLikePost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeLike/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function bookmarkPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/bookmark/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeBookmarkPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeBookmark/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function hardRedirect(uri: string) {
    console.log('redirecting');
    return redirect(uri);
};