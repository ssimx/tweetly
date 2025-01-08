import { blockUser, changeBirthday, changeEmail, changePassword, changeUsername, deactivateAccount, disablePushNotifications, enablePushNotifications, followUser, getProfileFollowers, getProfileFollowing, getProfileInfo, getUserFollowSuggestions, getUserInfo, getUserNotifications, unblockUser, unfollowUser, updateProfileInfo } from "../controllers/userController";

const express = require('express');
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
router.post('/follow/:username', followUser);
router.delete('/removeFollow/:username', unfollowUser);
router.get('/notifications', getUserNotifications);
router.post('/enableNotifications/:username', enablePushNotifications);
router.delete('/disableNotifications/:username', disablePushNotifications);
router.post('/block/:username', blockUser);
router.delete('/removeBlock/:username', unblockUser);
router.get('/:username', getProfileInfo);

export default router;