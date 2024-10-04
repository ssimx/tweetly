import { global30DayPosts, newPost } from "../controllers/postController";

const express = require('express');

const router = express.Router();

router.get('/globalFeed', global30DayPosts);
router.post('/create', newPost);
// router.post('/edit', newPost);
// router.post('/remove', newPost);
// router.post('/:postId', newPost);

export default router;