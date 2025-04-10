import express from 'express';
import {
    addBookmark,
    addLike,
    addRepost,
    getPost,
    getUserReplies,
    getUserLikes,
    postReplies,
    getUserPosts,
    getUserReposts,
    global30DayPosts,
    newPost,
    removeBookmark,
    removeLike,
    removeRepost,
    following30DayPosts,
    getUserBookmarks,
    trendingHashtags,
    exploreRandomPosts,
    getUserMedia,
    addPin,
    removePin,
    removePost,
} from "../controllers/postController.js";
import { newPostCheckup } from '../middleware/multer.js';
import { uploadToCloudinary } from './../middleware/cloudinary.js';

const router = express.Router();

router.get('/reposts/:username', getUserReposts);
router.get('/replies/:username', getUserReplies);
router.get('/media/:username', getUserMedia);
router.get('/likedPosts', getUserLikes);
router.get('/trending', trendingHashtags);
router.get('/explore', exploreRandomPosts);
router.get('/bookmarks', getUserBookmarks);
router.get('/status/:id', getPost);
router.get('/postReplies/:id', postReplies);
router.get('/feed/global', global30DayPosts);
router.get('/feed/following', following30DayPosts);
router.post('/create', newPostCheckup, uploadToCloudinary, newPost);
router.delete('/remove/:id', removePost);
router.post('/repost/:id', addRepost);
router.delete('/removeRepost/:id', removeRepost);
router.post('/like/:id', addLike);
router.delete('/removeLike/:id', removeLike);
router.post('/bookmark/:id', addBookmark);
router.delete('/removeBookmark/:id', removeBookmark);
router.post('/pin/:id', addPin);
router.delete('/removePin/:id', removePin);
router.get('/:username', getUserPosts);

// router.post('/edit', newPost);
// router.post('/remove', newPost);

export default router;