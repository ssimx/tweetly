'use client';
import { useCallback, useRef, useState } from "react";
import { BellPlus, BellOff, BellRing } from "lucide-react";
import { getErrorMessage, UserDataType } from 'tweetly-shared';
import { UserActionType } from '@/lib/userReducer';
import { disableNotificationsForUser, enableNotificationsForUser } from '@/actions/actions';
import { useAlertMessageContext } from '@/context/AlertMessageContextProvider';

type ProfileNotificationButtonProps = {
    user: string,
    userState: {
        relationship: Pick<UserDataType, 'relationship'>['relationship'],
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfileNotificationButton({ user, userState, dispatch }: ProfileNotificationButtonProps) {
    const { setAlertMessage } = useAlertMessageContext();
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

                    setAlertMessage('Notifications disabled');
                } else {
                    // Optimistically update UI
                    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });

                    const response = await enableNotificationsForUser(user);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }

                    setAlertMessage('Notifications enabled');
                }
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                // Revert state if exception occurs
                console.error(`Error toggling notifications for the user:`, errorMessage);
                dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
                setAlertMessage('Failed to toggle notifications for this user');
            } finally {
                setIsSubmitting(false);
            }
        },
        [notificationsEnabled, dispatch, user, isSubmitting, setAlertMessage],
    );

    return (
        <div>
            {
                notificationsEnabled
                    ? (
                        <button
                            className="w-fit hover:bg-secondary-foreground text-primary-text border border-primary-border font-bold rounded-full p-2 bg-transparent group"
                            onClick={handleNotificationsToggle}
                            ref={notificationBtn}
                        >
                            <BellRing size={20} className='text-primary-text block group-hover:hidden' />
                            <BellOff size={20} className='text-primary-text hidden group-hover:block' />
                        </button>
                    )
                    : <button
                        className='w-fit hover:bg-secondary-foreground text-primary-text border border-primary-border font-bold rounded-full p-2'
                        onClick={handleNotificationsToggle}
                        ref={notificationBtn}>
                        <BellPlus size={20} className='text-primary-text' />
                    </button>

            }
        </div>
    )
}
