import passport from "passport";
import { PassportError } from "../lib/types";
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { User } from "@prisma/client";
import { AppError } from 'tweetly-shared';

export function authenticateSettingsJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('settings-jwt', { session: false }, (err: PassportError, user: User | false, info: { message: string | null | undefined }) => {

        if (err) {
            console.log(err)
            next(new AppError(err.message, err.status || 400, err.name));
        }

        if (!user) {
            next(new AppError('Invalid settings token', 401, 'UNAUTHORIZED'));
        }

        req.user = user;
        next();
    })(req, res, next);
}