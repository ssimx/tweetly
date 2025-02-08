'use client';
import { getMoreNotifications } from '@/actions/get-actions';
import { NotificationPostType, NotificationType } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import NotificationPost from './NotificationPost';
import NotificationNewFollow from './NotificationNewFollow';

export default function NotificationsContent({ initialNotifications }: { initialNotifications: { notifications: NotificationType[], end: boolean } | undefined }) {
    const [notifications, setNotifications] = useState<NotificationType[] | undefined>(initialNotifications ? initialNotifications.notifications : undefined);
    
    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [notificationsCursor, setNotificationsCursor] = useState<number | null | undefined>(initialNotifications ? initialNotifications.notifications.length !== 0 ? initialNotifications.notifications.slice(-1)[0].id : null : undefined);
    const [notificationsEndReached, setNotificationsEndReached] = useState<boolean | undefined>(initialNotifications ? initialNotifications.end : undefined);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldNotifications = async () => {
                if (!notificationsEndReached && notificationsCursor) {
                    const { notifications, end } = await getMoreNotifications(notificationsCursor);
                    if (!notifications) return;

                    setNotifications(currentNotifications => [...currentNotifications as NotificationType[], ...notifications as NotificationType[]]);
                    setNotificationsCursor(notifications?.length ? notifications.slice(-1)[0].id : null);
                    setScrollPosition(scrollPositionRef.current);
                    setNotificationsEndReached(end);
                }
            };

            fetchOldNotifications();
        }
    }, [inView, notificationsCursor, notificationsEndReached, scrollPosition]);

    useEffect(() => {
        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            { notifications === undefined
                ? <div>Something went wrong</div>
                : notifications === null
                    ? <div>loading...</div>
                    : notifications.length === 0
                        ? <div>No notifications</div>
                        : notifications.map((notification, index) => (
                            <div key={index}>
                                {
                                    notification.type.name === 'FOLLOW'
                                        ? (
                                            <>
                                                <NotificationNewFollow isRead={notification.isRead} notifier={notification.notifier} />
                                                <div className='feed-hr-line'></div>
                                            </>
                                        )
                                        : notification.post && (
                                            <>
                                                <NotificationPost notification={notification as NotificationPostType} />
                                                <div className='feed-hr-line'></div>
                                            </>
                                        )
                                }
                            </div>
                        ))
            }

            {!notificationsEndReached && (
                <div ref={ref}>
                    <p>Loading...</p>
                </div>
            )}
        </section>
    )
}
