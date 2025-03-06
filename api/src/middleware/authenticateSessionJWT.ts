import passport from "passport";
import { PassportError } from "../lib/types";
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { User } from "@prisma/client";
import { AppError } from 'tweetly-shared';

export function authenticateSessionJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('session-jwt', { session: false }, (err: PassportError, user: User | false, info: { message: string | null | undefined }) => {

        if (err) {
            next(new AppError('Internal Server Error', 500, 'INTERNAL_SERVER_ERROR'));
        }

        if (!user) {
            next(new AppError('Invalid settings token', 401, 'UNAUTHORIZED'));
        }

        req.user = user;
        next();
    })(req, res, next);
};