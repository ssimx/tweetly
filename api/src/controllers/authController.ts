import { Request, Response } from 'express';
import { checkUserExsistence, createUserAndProfile, getUserLogin } from "../services/authService";
import { generateToken } from '../utils/jwt';
const bcrypt = require('bcrypt');

// ---------------------------------------------------------------------------------------------------------

interface signUpDataProps {
    username: string,
    dateOfBirth: string,
    email: string,
    password: string,
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, dateOfBirth, password } = req.body as signUpDataProps;

    try {
        // check if user already exists
        const existingUser = await checkUserExsistence(username, email);
        if (existingUser) {
            if (existingUser.username === username && existingUser.email === email) {
                return res.status(400).json({ error: 'username and email' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'username' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'email' });
            }
        }

        // Hash the password before saving it
        const hashedPassword: string = await bcrypt.hash(password, 10);

        // Convert date string to date
        const birthDate = new Date(dateOfBirth);

        // Try to save the new user
        const response = await createUserAndProfile({ username, email, birthDate, hashedPassword });

        // Check if there was a unique constraint violation
        if ('error' in response) {
            if (response.fields?.includes('username') && response.fields?.includes('email')) {
                return res.status(400).json({ error: 'username and email' });
            }
            if (response.fields?.includes('username')) {
                return res.status(400).json({ error: 'username' });
            }
            if (response.fields?.includes('email')) {
                return res.status(400).json({ error: 'email' });
            }
        } else {
            const tokenPayload = {
                id: response.user.id,
                username: username,
                name: username,
                email: email,
                profilePicture: '',
            }

            const token: string = generateToken(tokenPayload);
            return res.status(200).json({ token });
        }
    } catch (error) {
        console.error('Error saving form data: ', error);
        res.status(500).json({ error: 'Failed to process the data' });
    }
};

// ---------------------------------------------------------------------------------------------------------

interface logInDataProps {
    username: string,
    password: string,
};

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body as logInDataProps;

    try {
        // Find user in database
        const user = await getUserLogin(username);

        if (!user) {
            return res.status(401).json({ error: 'User not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect password'});
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
        }

        // Generate and send JWT token
        const token: string = generateToken(tokenPayload);
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};