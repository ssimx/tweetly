import { followUser, getProfileInfo, getUserInfo, unfollowUser } from "../controllers/userController";


const express = require('express');
const router = express.Router();

router.get('/', getUserInfo);
router.post('/follow/:username', followUser);
router.delete('/removeFollow/:username', unfollowUser);
router.get('/:username', getProfileInfo);

export default router;