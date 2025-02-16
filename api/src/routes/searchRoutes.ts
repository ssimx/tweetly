import { searchPostsWithCursor, usernameAvailable, searchUsers, searchUsersAndPosts } from "../controllers/searchController";

const express = require('express');
const router = express.Router();

router.get('/', searchUsersAndPosts);
router.get('/user', usernameAvailable);
router.get('/users', searchUsers);
router.get('/posts', searchPostsWithCursor);

export default router;