import { 
    addBookmark,
    addLike,
    addRepost,
    getPost,
    getUserReplies,
    getUserLikes,
    getPostReply,
    getUserPosts, 
    getUserReposts,
    global30DayPosts,
    newPost,
    removeBookmark,
    removeLike,
    removeRepost,
    following30DayPosts,
    getUserBookmarks,
 } from "../controllers/postController";

const express = require('express');

const router = express.Router();

router.get('/reposts/:username', getUserReposts);
router.get('/replies/:username', getUserReplies);
router.get('/likedPosts', getUserLikes);
router.get('/bookmarks', getUserBookmarks);
router.get('/status/:id', getPost);
router.get('/postReplies/:id', getPostReply);
router.get('/feed/global', global30DayPosts);
router.get('/feed/following', following30DayPosts);
router.post('/create', newPost);
router.post('/repost/:id', addRepost);
router.delete('/removeRepost/:id', removeRepost);
router.post('/like/:id', addLike);
router.delete('/removeLike/:id', removeLike);
router.post('/bookmark/:id', addBookmark);
router.delete('/removeBookmark/:id', removeBookmark);
router.get('/:username', getUserPosts);

// router.post('/edit', newPost);
// router.post('/remove', newPost);

export default router;