import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes';
import postRouter from './routes/postRoutes';
import userRouter from './routes/userRoutes';

import { configurePassport } from './middleware/passport';
import { User } from '@prisma/client';
import { PassportError } from './lib/types';
const passport = require('passport');
const cors = require('cors');

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(passport.initialize());
app.use(cors());

// Passport configuration
configurePassport(passport);

// Unprotected routes
app.use('/api/v1/auth', authRouter);

// JWT authentication for all routes under /api/v1 except for /api/v1/auth
app.use(
    '/api/v1', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('jwt', { session: false }, (err: PassportError, user: User | false, info: { message: string | null | undefined }) => {
            if (err) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!user) {
                return res.status(401).json({ error: info.message || 'Unauthorized' });
            }

            req.user = user;
            next();
        })(req, res, next);
    }
);

// JWT protected routes
app.use('/api/v1/post', postRouter);
app.use('/api/v1/user', userRouter);


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});