import { LoggedInUserJwtPayload, TemporaryUserJwtPayload } from 'tweetly-shared';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'tweetly';

// generate a session token
export const generateUserSessionToken = (payload: LoggedInUserJwtPayload): string => {
    return jwt.sign({
        type: 'user',
        id: payload.id,
        email: payload.email,
        username: payload.username,
    }, SECRET_KEY, {
        expiresIn: '30d',
    });
};

// generate a temporary user token
export const generateTemporaryUserToken = (payload: TemporaryUserJwtPayload): string => {
    return jwt.sign({
        type: 'temporary',
        id: payload.id,
        email: payload.email,
    }, SECRET_KEY, {
        expiresIn: '30d',
    });
};

// generate a settings token
export const generateUserSettingsToken = (payload: LoggedInUserJwtPayload): string => {
    return jwt.sign({
        type: 'settings',
        id: payload.id,
        email: payload.email,
        username: payload.username,
    }, SECRET_KEY, {
        expiresIn: '15m',
    });
}