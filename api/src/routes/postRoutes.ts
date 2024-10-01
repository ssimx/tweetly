import { newPost } from "../controllers/postController";

const express = require('express');

const router = express.Router();

router.post('/createpost', newPost);


export default router;