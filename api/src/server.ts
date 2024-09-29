import express, { type Express, type Request, type Response } from 'express';
const cors = require('cors');
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes';

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get('/api/v1/home', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.use('/api/v1/', authRouter);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});