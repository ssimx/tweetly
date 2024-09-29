import { User } from "@prisma/client";

const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'tweetly';

// generate a token
export const generateToken = (user: User) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
    }, SECRET_KEY, {
        expiresIn: '30d',
    });
};