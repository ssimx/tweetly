import { Request, Response } from 'express';
import { searchQueryCleanup } from '../utils/searchQueryCleanup';
import { getUserBySearch, getUsersBySearch } from '../services/userService';
import { UserProps } from '../lib/types';
import { getLastPostBySearch, getMorePostsBySearch, getPostsBySearch } from '../services/postService';

// ---------------------------------------------------------------------------------------------------------

export async function searchUser(req: Request, res: Response) {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "No search query provided" });

    const user = req.user as UserProps;

    try {
        // fetch user
        const fetchedUser = await getUserBySearch(query);

        return res.status(200).json(fetchedUser ? true : false);
    } catch (error) {
        console.error('Error fetching user: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export async function searchUsers(req: Request, res: Response) {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "No search query provided" });
    const queryParams = searchQueryCleanup(query);

    const user = req.user as UserProps;

    try {
        // fetch users
        let users = [];
        if (queryParams.usernames && queryParams.usernames.length > 0) {
            const fetchedUsers = await getUsersBySearch(user.id, queryParams.usernames);
            users.push(...fetchedUsers);
        } else if (queryParams.stringSegments && queryParams.stringSegments.length > 0) {
            const fetchedUsers = await getUsersBySearch(user.id, queryParams.stringSegments);
            users.push(...fetchedUsers);
        } 
        
        return res.status(200).json({
            users,
            queryParams
        })
    } catch (error) {
        console.error('Error fetching users: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export async function searchPostsWithCursor(req: Request, res: Response) {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "No search query provided" });
    const cursor = Number(req.query.cursor);
    if (!cursor) return res.status(400).json({ error: "No cursor provided" });
    const queryParams = searchQueryCleanup(query);

    const user = req.user as UserProps;

    try {
        // fetch posts that contain either hastags, users or strings
        const lastSearchPostId = await getLastPostBySearch(user.id, queryParams.segments).then(res => res?.id);
        if (lastSearchPostId) {
            if (cursor === lastSearchPostId) {
                return res.status(200).json({
                    posts: [],
                    end: true
                });
            }
        }

        const posts = await getMorePostsBySearch(user.id, queryParams.segments, cursor);
        
        if (lastSearchPostId && posts) {
            if (posts.slice(-1)[0].id === lastSearchPostId) {
                return res.status(200).json({
                    posts: posts,
                    end: true
                });
            } else {
                return res.status(200).json({
                    posts: posts,
                    end: false
                });
            }
        }

        return res.status(200).json({
            posts: [],
            end: true
        });
    } catch (error) {
        console.error('Error fetching posts: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export async function searchUsersAndPosts(req: Request, res: Response) {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "No search query provided" });
    const queryParams = searchQueryCleanup(query);

    const user = req.user as UserProps;

    try {
        // fetch users
        let usersPromise;
        if (queryParams.usernames && queryParams.usernames.length > 0) {
            usersPromise = getUsersBySearch(user.id, queryParams.usernames);
        } else if (queryParams.stringSegments && queryParams.stringSegments.length > 0) {
            usersPromise = getUsersBySearch(user.id, queryParams.stringSegments);
        }

        // fetch posts
        const lastSearchPostPromise = getLastPostBySearch(user.id, queryParams.segments);
        const postsPromise = getPostsBySearch(user.id, queryParams.segments);

        const [users, lastSearchPost, posts] = await Promise.all([
            usersPromise || Promise.resolve([]),
            lastSearchPostPromise || Promise.resolve([]),
            postsPromise || Promise.resolve([])
        ]);

        if (lastSearchPost && posts) {
            if (posts.slice(-1)[0].id === lastSearchPost.id) {
                return res.status(200).json({
                    users,
                    posts,
                    queryParams,
                    end: true
                });
            } else {
                return res.status(200).json({
                    users,
                    posts,
                    queryParams,
                    end: false
                });
            }
        }

        return res.status(200).json({
            users,
            posts: [],
            queryParams,
            end: true
        })
    } catch (error) {
        console.error('Error fetching users and posts: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};