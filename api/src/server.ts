import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes';
import postRouter from './routes/postRoutes';
import userRouter from './routes/userRoutes';
import searchRouter from './routes/searchRoutes';
import conversationRouter from './routes/conversationRoutes';
import { configurePassport } from './middleware/passport';
import { socketConnection } from './utils/sockets';
import { authenticateJWT } from './middleware/authenticateJWT';
const passport = require('passport');
const http = require("http");
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
app.use('/api/v1', authenticateJWT);

// JWT protected routes
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/conversations', conversationRouter);
app.use('/api/v1/search', searchRouter);

const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

socketConnection(server);
