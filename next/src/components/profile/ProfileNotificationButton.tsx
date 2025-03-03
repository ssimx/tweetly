'use client';
import { useCallback, useRef, useState } from "react";
import { BellPlus, BellOff, BellRing } from "lucide-react";
import { getErrorMessage, UserDataType } from 'tweetly-shared';
import { UserActionType } from '@/lib/userReducer';
import { disableNotificationsForUser, enableNotificationsForUser } from '@/actions/actions';

type ProfileNotificationButtonProps = {
    user: string,
    userState: {
        relationship: Pick<UserDataType, 'relationship'>['relationship'],
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfileNotificationButton({ user, userState, dispatch }: ProfileNotificationButtonProps) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const notificationBtn = useRef<HTMLButtonElement>(null);

    const { notificationsEnabled } = userState.relationship;

    const handleNotificationsToggle = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            if (isSubmitting) return;
            setIsSubmitting(true);

            try {
                if (notificationsEnabled) {
                    // Optimistically update UI
                    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });

                    const response = await disableNotificationsForUser(user);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                } else {
                    // Optimistically update UI
                    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });

                    const response = await enableNotificationsForUser(user);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                }
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                // Revert state if exception occurs
                console.error(`Error toggling notifications for the user:`, errorMessage);
                dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
            } finally {
                setIsSubmitting(false);
            }
        },
        [notificationsEnabled, dispatch, user, isSubmitting],
    );

    return (
        <div>
            {
                notificationsEnabled
                    ? (
                        <button
                            className="notifications-btn notifications-enabled group"
                            onClick={handleNotificationsToggle}
                            ref={notificationBtn}
                        >
                            <BellRing size={20} className='text-primary-text block group-hover:hidden' />
                            <BellOff size={20} className='text-primary-text hidden group-hover:block' />
                        </button>
                    )
                    : <button
                        className='notifications-btn'
                        onClick={handleNotificationsToggle}
                        ref={notificationBtn}>
                        <BellPlus size={20} className='text-primary-text' />
                    </button>

            }
        </div>
    )
}
