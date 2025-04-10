import passport from "passport";
import { type Request, type Response, type NextFunction } from 'express';
import { AppError, LoggedInTemporaryUserDataType, LoggedInUserDataType } from 'tweetly-shared';
import { PassportError } from "../lib/types.js";

export function authenticateSettingsJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('settings-jwt', { session: false }, (err: PassportError, user: LoggedInTemporaryUserDataType | LoggedInUserDataType | false, info: { message: string | null | undefined }) => {

        if (err) {
            next(new AppError(err.message, err.status || 400, err.name));
        }

        if (!user) {
            next(new AppError('Invalid settings token', 401, 'UNAUTHORIZED'));
        }

        req.user = user;
        next();
    })(req, res, next);
}