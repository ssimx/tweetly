import { UserTokenProps } from "../lib/types";

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'tweetly';

// generate a session token
export const generateToken = (user: UserTokenProps): string => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
    }, SECRET_KEY, {
        expiresIn: '30d',
    });
};

// generate a settings token
export const generateSettingsToken = (user: UserTokenProps): string => {
    return jwt.sign({
        id: user.id,
    }, SECRET_KEY, {
        expiresIn: '15m',
    });
}