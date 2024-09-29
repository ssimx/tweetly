import { Request, Response } from 'express';
import { createUserAndProfile, getUser } from "../services/authService";
import { generateToken } from '../utils/jwt';

const bcrypt = require('bcrypt');

interface signUpDataProps {
    username: string,
    dateOfBirth: string,
    email: string,
    password: string,
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, dateOfBirth, password } = req.body as signUpDataProps;
    console.log('Received form data: ', { username, email, dateOfBirth, password });

    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Convert date string to date
        const birthDate = new Date(dateOfBirth);

        // Save the new user
        const { user, profile } = await createUserAndProfile({ username, email, birthDate, hashedPassword });
        console.log('Saved data: ', { user, profile });
        
        // Generate and send JWT token
        const token = generateToken(user);
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error saving form data: ', error);
        res.status(500).json({ error: 'Failed to process the data' });
    }
};

interface logInDataProps {
    username: string,
    password: string,
};

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body as logInDataProps;
    console.log('Received form data: ', { username, password });

    try {
        // Find user in database
        const user = await getUser(username);

        if (!user) {
            return res.status(401).json({ message: 'User not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password'});
        }

        // Generate and send JWT token
        const token = generateToken(user);
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};