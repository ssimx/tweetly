import { Request, Response } from 'express';
import { searchQueryCleanup } from '../utils/searchQueryCleanup';
import { getUsersByUsername } from '../services/userService';
import { UserProps } from '../lib/types';

export async function searchUsers(req: Request, res: Response) {
    console.log('test');
    
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "No search query provided" });
    const queryParams = searchQueryCleanup(query);

    const user = req.user as UserProps;

    try {
        // fetch users
        let users = [];
        if (queryParams.usernames && queryParams.usernames.length > 0) {
            const fetchedUsers = await getUsersByUsername(user.id, queryParams.usernames);
            users.push(...fetchedUsers);
        } else if (queryParams.stringSegments && queryParams.stringSegments.length > 0) {
            const fetchedUsers = await getUsersByUsername(user.id, queryParams.stringSegments);
            users.push(...fetchedUsers);
        } 
        
        return res.status(200).json({
            users,
            queryParams
        })
    } catch (error) {
        
    }
};

// ---------------------------------------------------------------------------------------------------------

export async function searchPosts(req: Request, res: Response) {
    // const query = req.query.q as string;
    // if (!query) return res.status(400).json({ error: "No search query provided" });
    // const queryParams = searchQueryCleanup(query);

    // const user = req.user as UserProps;

    // try {
    //     // fetch posts, users
    //     let posts = [];
    //     if (queryParams.segments && queryParams.segments.length > 0) {
    //     }

    //     return res.status(200).json({
    //         posts,
    //         queryParams
    //     })
    // } catch (error) {

    // }
};