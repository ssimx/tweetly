import { searchPostsWithCursor, usernameOrEmailLookup, searchUsers, searchUsersAndPosts } from "../controllers/searchController";

import express from 'express';

const router = express.Router();

router.get('/', searchUsersAndPosts);
router.get('/user', usernameOrEmailLookup);
router.get('/users', searchUsers);
router.get('/posts', searchPostsWithCursor);

export default router;