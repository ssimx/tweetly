import passport from "passport";
import { type Request, type Response, type NextFunction } from 'express';
import { AppError, LoggedInTemporaryUserDataType, LoggedInUserDataType } from 'tweetly-shared';
import { PassportError } from "../lib/types.js";

export function authenticateSessionJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('session-jwt', { session: false }, (err: PassportError, user: LoggedInTemporaryUserDataType | LoggedInUserDataType | false, info: { message: string | null | undefined }) => {

        if (err) {
            next(new AppError('Internal Server Error', 500, 'INTERNAL_SERVER_ERROR'));
        }

        if (!user) {
            next(new AppError('Invalid session token', 401, 'UNAUTHORIZED'));
        }

        req.user = user;
        next();
    })(req, res, next);
};