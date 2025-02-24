import { PrismaClient } from '@prisma/client';
import { Strategy, ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt';
import { PassportStatic } from 'passport';
import { UserProps } from '../lib/types';
const prisma = new PrismaClient({
    omit: {
        user: {
            password: true
        },
        temporaryUser: {
            password: true
        }
    }
});

const SECRET_KEY = process.env.JWT_SECRET || 'tweetly';

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY,
}

const strategy = new Strategy(options, async (payload: { type: 'user' | 'temporary', id: number }, done: VerifiedCallback) => {
    try {
        if (payload.type === 'user') {
            const user = await prisma.user.findUnique({
                where: {
                    id: payload.id,
                },
            });

            if (user) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'User not found' });
            }
        } else if (payload.type === 'temporary') {
            const user = await prisma.temporaryUser.findUnique({
                where: {
                    id: payload.id,
                },
            });

            if (user) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Temporary user not found' });
            }
        } else {
            throw new Error('Invalid JWT');
        }
    } catch (error) {
        console.error('Error during JWT verification:', error);
        return done(error, false);
    }
});

export const configurePassport = (passport: PassportStatic) => {
    passport.use(strategy);
};