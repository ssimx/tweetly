import { Request, Response } from 'express';
import { createUserAndProfile } from "../services/authService";

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


        res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error saving form data: ', error);
        res.status(500).json({ error: 'Failed to process the data' });
    }
};