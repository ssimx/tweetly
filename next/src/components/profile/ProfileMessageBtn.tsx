'use client';
import { createNewConversation } from '@/actions/actions';
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ErrorResponse, getErrorMessage, SuccessResponse } from 'tweetly-shared';

export default function ProfileMessageBtn({ profileUser, conversationId }: { profileUser: string, conversationId: string | null }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleConvoClick = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            if (isSubmitting) return;
            setIsSubmitting(true);

            if (conversationId) {
                router.push(`/conversation/${conversationId}`);
                return;
            }

            try {
                const response = await createNewConversation(profileUser);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response as SuccessResponse<{ conversationId: string }>;
                if (data === undefined) throw new Error('Data is missing in response');
                else if (data.conversationId === undefined) throw new Error('ConversationId is missing in data response');

                router.push(`/conversation/${data.conversationId}`);
                return;
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                console.error(`Error while trying to create a new conversation:`, errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        }, [conversationId, isSubmitting, profileUser, router]
    );

    return (
        <button
            className={`w-fit cursor-pointer hover:bg-secondary-foreground text-primary-text border border-primary-border font-bold rounded-full p-2 ${isSubmitting ? 'disabled' : ''}`}
            onClick={(e) => handleConvoClick(e)}
        >
            <Mail size={20} className='text-primary-text' />
        </button>
    )
};