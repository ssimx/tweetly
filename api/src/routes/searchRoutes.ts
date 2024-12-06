import { searchPosts, searchUsers } from "../controllers/searchController";

const express = require('express');
const router = express.Router();

router.get('/users', searchUsers);
router.get('/posts', searchPosts);

export default router;