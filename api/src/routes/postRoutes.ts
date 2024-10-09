import { addBookmark, addLike, addRepost, getPost, getReplies, global30DayPosts, newPost, removeBookmark, removeLike, removeRepost } from "../controllers/postController";

const express = require('express');

const router = express.Router();

router.get('/status/:id', getPost);
router.get('/replies/:id', getReplies);
router.get('/feed/global', global30DayPosts);
router.post('/create', newPost);
router.post('/repost/:id', addRepost);
router.delete('/removeRepost/:id', removeRepost);
router.post('/like/:id', addLike);
router.delete('/removeLike/:id', removeLike);
router.post('/bookmark/:id', addBookmark);
router.delete('/removeBookmark/:id', removeBookmark);

// router.post('/edit', newPost);
// router.post('/remove', newPost);

export default router;