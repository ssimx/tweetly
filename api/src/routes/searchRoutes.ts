import express from 'express';
import { searchPostsWithCursor, usernameOrEmailLookup, searchUsers, searchUsersAndPosts } from "../controllers/searchController.js";
import { authenticateSessionJWT } from '../middleware/authenticateSessionJWT.js';

const router = express.Router();

router.get('/', authenticateSessionJWT, searchUsersAndPosts);
router.get('/user', usernameOrEmailLookup);
router.get('/users', authenticateSessionJWT, searchUsers);
router.get('/posts', authenticateSessionJWT, searchPostsWithCursor);

export default router;