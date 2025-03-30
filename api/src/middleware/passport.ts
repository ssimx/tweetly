import { PrismaClient } from '@prisma/client';
import { Strategy, ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt';
import { PassportStatic } from 'passport';
import { Request } from 'express';

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

const sessionStrategyOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY,
}

const sessionStrategy = new Strategy(sessionStrategyOptions, async (payload: { type: 'user' | 'temporary', id: number }, done: VerifiedCallback) => {
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
        return done(null, false);
    }
});

export const configurePassport = (passport: PassportStatic) => {
    passport.use('session-jwt', sessionStrategy);
};

// --------------------------------------------------------------------------------------------------------------------------

// Custom extractor for settings token from header
const settingsTokenExtractor = (req: Request) => {
    const token = req.header('Settings-Token') as string;

    if (!token) {
        return null;
    }

    if (token.startsWith('Bearer ')) {
        // Remove the Bearer prefix
        return token.slice(7);
    }

    return token;
};

const settingsStrategyOptions: StrategyOptions = {
    jwtFromRequest: settingsTokenExtractor,
    secretOrKey: SECRET_KEY,
};

const settingsStrategy = new Strategy(settingsStrategyOptions, async (payload: { type: 'settings', id: number }, done: VerifiedCallback) => {
    try {
        // Additional check to ensure this is a settings update token
        if (payload.type === 'settings') {
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
        } else {
            throw new Error('Invalid settings token');
        }
    } catch (error) {
        return done(error, false);
    }
}
);

export const configureSettingsPassport = (passport: PassportStatic) => {
    passport.use('settings-jwt', settingsStrategy);
};