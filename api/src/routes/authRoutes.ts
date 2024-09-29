import { loginUser, registerUser } from "../controllers/authController";

const express = require('express');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


export default router;