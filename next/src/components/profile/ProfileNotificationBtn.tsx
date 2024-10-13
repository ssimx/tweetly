'use client';

import { useRef, useState } from "react";
import { BellPlus, BellOff, BellRing } from "lucide-react";

interface NotificationsBtnType {
    username: string,
    notificationsEnabled: boolean,
    setNotificationsEnabled: React.Dispatch<React.SetStateAction<boolean>>,
};

export default function ProfileNotificationBtn({ username, notificationsEnabled, setNotificationsEnabled }: NotificationsBtnType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const notificationBtn = useRef<HTMLButtonElement>(null);


    const handleNotification = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        notificationBtn.current && notificationBtn.current.setAttribute('disabled', "");

        try {
            if (notificationsEnabled) {
                // const unfollow = await fetch(`/api/users/disableNotification/${username}`, {
                //     method: 'DELETE',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     }
                // });

                // if (!unfollow) throw new Error("Couldn't disable notifications for the user");

                setNotificationsEnabled(false);
                return;
            } else {
                // const follow = await fetch(`/api/users/enableNotification/${username}`, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     }
                // });

                // if (!follow) throw new Error("Couldn't enable notifications for the user");

                setNotificationsEnabled(true);
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            notificationBtn.current && notificationBtn.current.removeAttribute('disabled');
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {
                notificationsEnabled
                    ? (
                        <button
                            className="notifications-btn notifications-enabled group"
                            onClick={(e) => handleNotification(e)} ref={notificationBtn}>
                                <BellRing size={20} className='text-black-1 block group-hover:hidden' />
                                <BellOff size={20} className='text-black-1 hidden group-hover:block' />
                        </button>
                    )
                    : <button className='notifications-btn' onClick={handleNotification} ref={notificationBtn}>
                        <BellPlus size={20} className='text-black-1' />
                    </button>

            }
        </div>
    )
}
