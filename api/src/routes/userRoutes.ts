import { followUser, getProfileInfo, getUserInfo, unfollowUser, updateProfileInfo } from "../controllers/userController";

const express = require('express');
const router = express.Router();

router.get('/', getUserInfo);
router.post('/follow/:username', followUser);
router.post('/updateProfile/:username', updateProfileInfo);
router.delete('/removeFollow/:username', unfollowUser);
router.get('/:username', getProfileInfo);

export default router;