import 'server-only';
import { UserInfo } from './types';
import { getToken } from './session';

export async function fetchUserData() {
    try {
        const token = getToken();
        if (!token) {
            throw new Error("Unauthorized: No token provided");
        }

        const response = await fetch('http://localhost:3000/api/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        const userData = await response.json() as UserInfo;
        return userData;
    } catch (error) {
        console.error(error);
        return;
    }
};