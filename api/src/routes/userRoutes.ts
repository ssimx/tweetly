import { blockUser, followUser, getProfileInfo, getUserInfo, unblockUser, unfollowUser, updateProfileInfo } from "../controllers/userController";

const express = require('express');
const router = express.Router();

router.get('/', getUserInfo);
router.get('/:username', getProfileInfo);
router.post('/updateProfile/:username', updateProfileInfo);
router.post('/follow/:username', followUser);
router.delete('/removeFollow/:username', unfollowUser);
router.post('/block/:username', blockUser);
router.delete('/removeBlock/:username', unblockUser);

export default router;