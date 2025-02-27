import { Request, Response } from 'express';
import { searchQueryCleanup } from '../utils/searchQueryCleanup';
import { getUserByEmail, getUserByUsername, getUsersBySearch } from '../services/userService';
import { UserProps } from '../lib/types';
import { getLastPostBySearch, getMorePostsBySearch, getPostsBySearch } from '../services/postService';
import { usernameOrEmailAvailibilitySchema } from 'tweetly-shared';

// ---------------------------------------------------------------------------------------------------------

export async function usernameOrEmailLookup(req: Request, res: Response) {
    const type = req.query.type as string;
    const data = req.query.data as string;
    if (!type || !data) return res.status(400).json({ error: "No search query provided" });

    try {
        // Decode and validate type and data
        const decodedType = decodeURIComponent(type);
        const decodedData = decodeURIComponent(data);
        usernameOrEmailAvailibilitySchema.parse({ type: decodedType, data: decodedData });

        // fetch user
        const fetchedUser = type === 'username' ? await getUserByUsername(data) : await getUserByEmail(data);

        return res.status(200).json(fetchedUser ? false : true);
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

export async function searchUsersAndPosts(req: Request, res: Response) {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "No search query provided" });
    const queryParams = searchQueryCleanup(query);

    const user = req.user as UserProps;

    try {
        // fetch users
        let usersPromise;
        let userSearchParams: string[] = [];
        if (queryParams.usernames.length) {
            // check if queryParams has usernames by checking input for @
            usersPromise = getUsersBySearch(user.id, queryParams.usernames);
            userSearchParams = queryParams.usernames;
        } else if (queryParams.stringSegments.length) {
            // if not, use string segments instead
            usersPromise = getUsersBySearch(user.id, queryParams.stringSegments);
            userSearchParams = queryParams.stringSegments;
        }

        // fetch posts
        const lastSearchPostPromise = getLastPostBySearch(user.id, queryParams.segments);
        const postsPromise = getPostsBySearch(user.id, queryParams.segments);

        const [users, lastSearchPost, posts] = await Promise.all([
            usersPromise || Promise.resolve([]),
            lastSearchPostPromise || Promise.resolve([]),
            postsPromise || Promise.resolve([])
        ]);

        // Prioritize users based on match specificity
        const prioritizedUsers = users.map((user) => {
            const { username, profile } = user;
            const name = profile?.name || "";
            let priority = 0;

            userSearchParams.forEach((term) => {
                const lowerTerm = term.toLowerCase();
                const lowerUsername = username.toLowerCase();
                const lowerName = name.toLowerCase();

                // Username matches
                if (lowerUsername === lowerTerm) {
                    priority += 3; // Exact match
                } else if (lowerUsername.startsWith(lowerTerm)) {
                    priority += 2; // Starts with
                } else if (lowerUsername.includes(lowerTerm)) {
                    priority += 1; // Partial match
                }

                // Name matches
                if (lowerName === lowerTerm) {
                    priority += 3; // Exact match
                } else if (lowerName.startsWith(lowerTerm)) {
                    priority += 2; // Starts with
                } else if (lowerName.includes(lowerTerm)) {
                    priority += 1; // Partial match
                }
            });

            return { ...user, priority };
        }).sort((a, b) => b.priority - a.priority);

        return res.status(200).json({
            users: prioritizedUsers,
            posts: posts,
            searchSegments: queryParams.stringSegments,
            end: !lastSearchPost
                ? true
                : !posts.length
                    ? true
                    : lastSearchPost.id === posts.slice(-1)[0].id
                        ? true
                        : false
        })
    } catch (error) {
        console.error('Error fetching users and posts: ', error);
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
        const lastSearchPostId = await getLastPostBySearch(user.id, queryParams.segments).then(res => res?.id);
        if (lastSearchPostId) {
            // check if current cursor equals last post id
            // if truthy, return empty array and set the end to true
            if (Number(cursor) === lastSearchPostId) {
                return res.status(200).json({
                    posts: [],
                    end: true
                });
            }
        }

        const posts = await getPostsBySearch(user.id, queryParams.segments, cursor);

        return res.status(200).json({
            posts: posts,
            // check if older posts array is empty and if truthy set the end to true
            // check if new cursor equals last post id
            //  if truthy, return older posts and set the end to true
            end: posts.length === 0
                ? true
                : lastSearchPostId === posts.slice(-1)[0].id
                    ? true
                    : false,
        });
    } catch (error) {
        console.error('Error fetching posts: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};