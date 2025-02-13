'use client';
import { getMoreNotifications } from '@/actions/get-actions';
import { NotificationType, BasicPostType, UserInfoType, ReplyPostType } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import NotificationPost from './NotificationPost';
import NotificationRepost from './NotificationRepost';
import NotificationLike from './NotificationLike';
import NotificationReply from './NotificationReply';
import NotificationFollow from './NotificationFollow';

export default function NotificationsContent({ initialNotifications }: { initialNotifications: { notifications: NotificationType[], end: boolean } | undefined }) {
    const [notifications, setNotifications] = useState<NotificationType[] | undefined>(initialNotifications ? initialNotifications.notifications : undefined);
    console.log(initialNotifications)
    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [notificationsCursor, setNotificationsCursor] = useState<number | null | undefined>(initialNotifications ? initialNotifications.notifications.length !== 0 ? initialNotifications.notifications.slice(-1)[0].id : null : undefined);
    const [notificationsEndReached, setNotificationsEndReached] = useState<boolean>(initialNotifications ? initialNotifications.end : true);
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
        const controller = new AbortController();

        // Track scroll position on user scroll
        window.addEventListener('scroll', () => {
            scrollPositionRef.current = window.scrollY;
        }, { passive: true, signal: controller.signal });

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            {notifications === undefined
                ? <div>Something went wrong</div>
                : notifications === null
                    ? <div>loading...</div>
                    : notifications.length === 0
                        ? <div>No notifications</div>
                        : notifications.map((notification) => (
                            <div key={notification.id}>

                                {notification.type.name === 'POST' && notification.post && (
                                    <>
                                        <NotificationPost post={notification.post as BasicPostType} isRead={notification.isRead} />
                                        <div className='feed-hr-line'></div>
                                    </>
                                )}

                                {notification.type.name === 'REPLY' && notification.post && 'replyTo' in notification.post && notification.post.replyTo && (
                                    <>
                                        <NotificationReply post={notification.post as ReplyPostType} isRead={notification.isRead} />
                                        <div className='feed-hr-line'></div>
                                    </>
                                )}

                                {notification.type.name === 'REPOST' && notification.post && (
                                    <>
                                        <NotificationRepost post={notification.post as BasicPostType} notifier={notification.notifier as UserInfoType} isRead={notification.isRead} />
                                        <div className='feed-hr-line'></div>
                                    </>
                                )}

                                {notification.type.name === 'LIKE' && notification.post && (
                                    <>
                                        <NotificationLike post={notification.post as BasicPostType} notifier={notification.notifier as UserInfoType} isRead={notification.isRead} />
                                        <div className='feed-hr-line'></div>
                                    </>
                                )}

                                {notification.type.name === 'FOLLOW' && (
                                    <>
                                        <NotificationFollow notifier={notification.notifier} isRead={notification.isRead} />
                                        <div className='feed-hr-line'></div>
                                    </>
                                )}

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
