import { UserInfo, JwtPayload } from './types';
import { decryptSession, getToken, removeSession } from './session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function fetchUserData() {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error("Unauthorized: No token provided");
        }

        const response = await fetch('http://localhost:3000/api/users', {
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

        const username = await decryptSession(token).then(res => res?.username);
        console.log(username, userData.username);

        if (userData.username !== username) {
            cookies().delete('access-token');
            return null;
        }

        return userData;
    } catch (error) {
        return;
    }
};