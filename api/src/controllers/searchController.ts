import { NextFunction, Request, Response } from 'express';
import { getUserByEmail, getUserByUsername, getUsersBySearch } from '../services/userService';
import { UserProps } from '../lib/types';
import { getLastPostBySearch, getPostsBySearch } from '../services/postService';
import { AppError, BasePostDataType, LoggedInUserDataType, searchQueryCleanup, SearchQuerySegmentsType, SuccessResponse, UserDataType, usernameOrEmailAvailibilitySchema } from 'tweetly-shared';
import { remapPostInformation, remapUserInformation } from '../lib/helpers';

// ---------------------------------------------------------------------------------------------------------

export async function usernameOrEmailLookup(req: Request, res: Response, next: NextFunction) {
    const type = req.query.type as string | undefined;
    const data = req.query.data as string | undefined;

    try {
        if (!type || !data) throw new AppError('Type/data search params are missing', 404, 'MISSING_PARAMS');

        // Decode and validate type and data
        const decodedType = decodeURIComponent(type);
        const decodedData = decodeURIComponent(data);
        usernameOrEmailAvailibilitySchema.parse({ type: decodedType, data: decodedData });

        // fetch user
        const fetchedUser = type === 'username' ? await getUserByUsername(data) : await getUserByEmail(data);

        const successResponse: SuccessResponse<{ available: boolean }> = {
            success: true,
            data: {
                available: fetchedUser ? false : true
            },
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export async function searchUsers(req: Request, res: Response, next: NextFunction) {
    const user = req.user as LoggedInUserDataType;
    const query = req.query.q as string;

    try {
        if (!query) throw new AppError('Search query is missing', 404, 'MISSING_QUERY');
        const queryParams = searchQueryCleanup(query);

        // fetch users
        let users = [];
        if (queryParams.usernames && queryParams.usernames.length > 0) {
            const fetchedUsers = await getUsersBySearch(user.id, queryParams.usernames);
            users.push(...fetchedUsers);
        } else if (queryParams.stringSegments && queryParams.stringSegments.length > 0) {
            const fetchedUsers = await getUsersBySearch(user.id, queryParams.stringSegments);
            users.push(...fetchedUsers);
        }

        let remappedUsers: UserDataType[] = [];
        if (users.length !== 0) {
            // Remap users
            users.forEach((user) => {
                remappedUsers.push(remapUserInformation(user));
            });

            // Prioritize user results by match specificity
            const prioritizedUsers = remappedUsers.map((user) => {
                const { username, profile } = user;
                const name = profile.name;
                let priority = 0;

                queryParams.usernames.forEach((term) => {
                    if (username.toLowerCase() === term.toLowerCase()) {
                        priority += 3; // Exact match to username
                    } else if (username.toLowerCase().startsWith(term.toLowerCase())) {
                        priority += 2; // Starts with username
                    } else if (username.toLowerCase().includes(term.toLowerCase())) {
                        priority += 1; // Partial match to username
                    }

                    if (name.toLowerCase() === term.toLowerCase()) {
                        priority += 3; // Exact match to name
                    } else if (name.toLowerCase().startsWith(term.toLowerCase())) {
                        priority += 2; // Starts with name
                    } else if (name.toLowerCase().includes(term.toLowerCase())) {
                        priority += 1; // Partial match to name
                    }
                });

                return { ...user, priority };
            });

            // Sort by priority in descending order
            remappedUsers = prioritizedUsers.sort((a, b) => b.priority - a.priority) as UserDataType[];
        }

        const successResponse: SuccessResponse<{ users: UserDataType[], queryParams: SearchQuerySegmentsType }> = {
            success: true,
            data: {
                users: remappedUsers,
                queryParams: queryParams
            },
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export async function searchUsersAndPosts(req: Request, res: Response, next: NextFunction) {
    const query = req.query.q as string;
    const user = req.user as UserProps;

    try {
        if (!query) throw new AppError('Search query is missing', 404, 'MISSING_QUERY');
        const queryParams = searchQueryCleanup(query);

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

        const [users, lastSearchPost, postsData] = await Promise.all([
            usersPromise || Promise.resolve([]),
            lastSearchPostPromise || Promise.resolve([]),
            postsPromise || Promise.resolve([])
        ]);

        let remappedUsers: UserDataType[] = [];
        if (users.length !== 0) {
            // Remap users
            users.forEach((user) => {
                remappedUsers.push(remapUserInformation(user));
            });

            // Prioritize user results by match specificity
            const prioritizedUsers = remappedUsers.map((user) => {
                const { username, profile } = user;
                const name = profile.name;
                let priority = 0;

                queryParams.usernames.forEach((term) => {
                    if (username.toLowerCase() === term.toLowerCase()) {
                        priority += 3; // Exact match to username
                    } else if (username.toLowerCase().startsWith(term.toLowerCase())) {
                        priority += 2; // Starts with username
                    } else if (username.toLowerCase().includes(term.toLowerCase())) {
                        priority += 1; // Partial match to username
                    }

                    if (name.toLowerCase() === term.toLowerCase()) {
                        priority += 3; // Exact match to name
                    } else if (name.toLowerCase().startsWith(term.toLowerCase())) {
                        priority += 2; // Starts with name
                    } else if (name.toLowerCase().includes(term.toLowerCase())) {
                        priority += 1; // Partial match to name
                    }
                });

                return { ...user, priority };
            });

            // Sort by priority in descending order
            remappedUsers = prioritizedUsers.sort((a, b) => b.priority - a.priority) as UserDataType[];
        }

        const posts = postsData.map((post) => {
            // skip if there's no information
            if (!post) return;
            if (!post.author) return;
            if (!post.author.profile) return;

            return remapPostInformation(post);
        }).filter((post): post is NonNullable<typeof post> => post !== undefined);

        const postsEnd = posts.length === 0
            ? true
            : lastSearchPost?.id === posts.slice(-1)[0]?.id
                ? true
                : false

        const successResponse: SuccessResponse<{
            users: UserDataType[],
            posts: BasePostDataType[],
            postsCursor: number,
            postsEnd: boolean,
            queryParams: SearchQuerySegmentsType
        }> = {
            success: true,
            data: {
                users: remappedUsers,
                posts: posts,
                postsCursor: posts.slice(-1)[0]?.id ?? null,
                postsEnd: postsEnd,
                queryParams: queryParams
            },
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export async function searchPostsWithCursor(req: Request, res: Response, next: NextFunction) {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "No search query provided" });
    const cursor = Number(req.query.cursor);
    if (!cursor) return res.status(400).json({ error: "No cursor provided" });
    const queryParams = searchQueryCleanup(query);

    const user = req.user as UserProps;

    try {
        if (!query) throw new AppError('Query not found in search params', 404, 'MISSING_PARAM');
        if (!cursor) throw new AppError('Cursor not found in search params', 404, 'MISSING_PARAM');
        const queryParams = searchQueryCleanup(query);

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

        const postsData = await getPostsBySearch(user.id, queryParams.segments, cursor);

        const posts = postsData.map((post) => {
            // skip if there's no information
            if (!post) return;
            if (!post.author) return;
            if (!post.author.profile) return;

            return remapPostInformation(post);
        }).filter((post): post is NonNullable<typeof post> => post !== undefined);

        const end = posts.length === 0
            ? true
            : lastSearchPostId === posts.slice(-1)[0]?.id
                ? true
                : false

        const successResponse: SuccessResponse<{
            posts: BasePostDataType[],
            cursor: number,
            end: boolean,
        }> = {
            success: true,
            data: {
                posts: posts,
                cursor: posts.slice(-1)[0]?.id ?? null,
                end: end,
            },
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};