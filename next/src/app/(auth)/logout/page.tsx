'use client';
import { useRouter } from "next/navigation";
import { getErrorMessage } from 'tweetly-shared';

export default function LogoutPage() {
    const router = useRouter();

    const logOut = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = getErrorMessage(errorData);
                throw new Error(getErrorMessage(errorMessage));
            }

            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    logOut();

    return (
        <>

        </>
    )
}
