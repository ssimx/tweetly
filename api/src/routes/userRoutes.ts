import { getProfileInfo, getUserInfo } from "../controllers/userController";


const express = require('express');
const router = express.Router();

router.get('/', getUserInfo);
router.get('/:username', getProfileInfo);

export default router;