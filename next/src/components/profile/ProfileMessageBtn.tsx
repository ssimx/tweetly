'use client';
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileMessageBtn({ profileUser, conversationId }: { profileUser: string, conversationId: string | undefined }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleConvoClick = () => {
        if (loading) return;

        if (conversationId) {
            router.push(`/messages/${conversationId}`);
        } else {
            const doChecks = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/conversations/create/${profileUser}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to create a new conversation');
                    }

                    const conversationId = await response.json();

                    router.push(`/messages/${conversationId}`);
                } catch (error) {
                    console.error('Error handling conversation:', error);
                } finally {
                    setLoading(false);
                }
            };

            doChecks();
        }
    };

    return (
        <button className={`message-btn ${loading ? 'disabled' : null}`}
            onClick={handleConvoClick} >
            <Mail size={20} className='text-primary-text' />
        </button>
    )
};