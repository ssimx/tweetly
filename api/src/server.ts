import express, { type Express } from 'express';
import { config } from 'dotenv';
import authRouter from './routes/authRoutes.js';
import postRouter from './routes/postRoutes.js';
import userRouter from './routes/userRoutes.js';
import searchRouter from './routes/searchRoutes.js';
import conversationRouter from './routes/conversationRoutes.js';
import { configurePassport, configureSettingsPassport } from './middleware/passport.js';
import { authenticateSessionJWT } from './middleware/authenticateSessionJWT.js';
import { errorHandler } from './middleware/errorHandler.js';
import passport from 'passport';
import cors from 'cors';
import { socketConnection } from './utils/sockets.js';

const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
config({ path: envFile });

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(passport.initialize());
app.use(cors());

// Passport configuration
configurePassport(passport);
configureSettingsPassport(passport);

// Unprotected routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/search', searchRouter);

// JWT authentication for all routes under /api/v1 except for /api/v1/auth
app.use('/api/v1', authenticateSessionJWT);

// JWT protected routes
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/conversations', conversationRouter);

// Error-handling
app.use(errorHandler);

const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://192.168.1.155:${port}`);
});

socketConnection(server);
