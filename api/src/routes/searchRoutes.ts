import { searchPostsWithCursor, searchUser, searchUsers, searchUsersAndPosts } from "../controllers/searchController";

const express = require('express');
const router = express.Router();

router.get('/', searchUsersAndPosts);
router.get('/user', searchUser);
router.get('/users', searchUsers);
router.get('/posts', searchPostsWithCursor);

export default router;