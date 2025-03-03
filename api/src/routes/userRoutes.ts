import { blockUser, changeBirthday, changeEmail, changePassword, changeUsername, deactivateAccount, disablePushNotifications, enablePushNotifications, followUser, getProfileFollowers, getProfileFollowing, getProfileInfo, getTemporaryUserInfo, getUserFollowSuggestions, getUserInfo, getUserNotifications, unblockUser, unfollowUser, updateProfileInfo } from "../controllers/userController";

import express from 'express';

const router = express.Router();

router.get('/', getUserInfo);
router.post('/updateProfile/:username', updateProfileInfo);
router.patch('/username', changeUsername);
router.patch('/password', changePassword);
router.patch('/birthday', changeBirthday);
router.patch('/email', changeEmail);
router.patch('/deactivate', deactivateAccount);
router.get('/followers/:username', getProfileFollowers);
router.get('/following/:username', getProfileFollowing);
router.get('/followSuggestions', getUserFollowSuggestions);
router.patch('/follow/:username', followUser);
router.patch('/removeFollow/:username', unfollowUser);
router.get('/notifications', getUserNotifications);
router.patch('/enableNotifications/:username', enablePushNotifications);
router.patch('/disableNotifications/:username', disablePushNotifications);
router.patch('/block/:username', blockUser);
router.patch('/removeBlock/:username', unblockUser);
router.get('/temporary', getTemporaryUserInfo);
router.get('/:username', getProfileInfo);

export default router;