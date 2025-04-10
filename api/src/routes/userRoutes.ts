import { blockUser, changeBirthday, changeEmail, changePassword, changeUsername, disablePushNotifications, enablePushNotifications, followUser, getProfileFollowers, getProfileFollowing, getProfileInfo, getTemporaryUserInfo, getUserFollowSuggestions, getUserInfo, getUserNotifications, unblockUser, unfollowUser, updateProfileInfo } from "../controllers/userController";

import express from 'express';
import { authenticateSettingsJWT } from '../middleware/authenticateSettingsJWT';
import { updateProfileCheckup } from '../middleware/multer';
import { uploadToCloudinary } from '../middleware/cloudinary';

const router = express.Router();

router.get('/', getUserInfo);
router.patch('/updateProfile', updateProfileCheckup, uploadToCloudinary, updateProfileInfo);
router.patch('/username', authenticateSettingsJWT, changeUsername);
router.patch('/password', authenticateSettingsJWT, changePassword);
router.patch('/birthday', authenticateSettingsJWT, changeBirthday);
router.patch('/email', authenticateSettingsJWT, changeEmail);
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