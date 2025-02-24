import passport from "passport";
import { PassportError } from "../lib/types";
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { User } from "@prisma/client";

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('jwt', { session: false }, (err: PassportError, user: User | false, info: { message: string | null | undefined }) => {

        if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!user) {
            console.log('unauth');

            return res.status(401).json({ error: info.message || 'Unauthorized' });
        }

        req.user = user;
        next();
    })(req, res, next);
}