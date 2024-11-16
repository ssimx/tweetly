'use client';
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const router = useRouter();

    const logOut = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
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
