'use client';
import { getMoreNotifications } from '@/actions/get-actions';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import NotificationPost from './NotificationPost';
import NotificationReply from './NotificationReply';
import NotificationFollow from './NotificationFollow';
import { BasePostDataType, ErrorResponse, getErrorMessage, NotificationType, UserDataType } from 'tweetly-shared';
import NotificationsNoContent from './NotificationsNoContent';
import NotificationRepostedReply from './NotificationRepostedReply';
import NotificationRepostedPost from './NotificationRepostedPost';
import NotificationLikedReply from './NotificationLikedReply';
import NotificationLikedPost from './NotificationLikedPost';

export default function NotificationsContent({ initialNotifications, cursor, end }: { initialNotifications: NotificationType[] | null, cursor: number | null, end: boolean }) {
    const [notifications, setNotifications] = useState<NotificationType[] | null>(initialNotifications);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [notificationsCursor, setNotificationsCursor] = useState<number | null>(cursor);
    const [notificationsEndReached, setNotificationsEndReached] = useState<boolean>(end);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldNotifications = async () => {
                if ((!notificationsEndReached && notificationsCursor)) {
                    try {
                        const response = await getMoreNotifications(notificationsCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.notifications === undefined) throw new Error('Notifications property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setNotifications((current) => [...current as NotificationType[], ...data.notifications as NotificationType[]]);
                        setNotificationsCursor(data.cursor);
                        setNotificationsEndReached(data.end);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setNotificationsCursor(null);
                        setNotificationsEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                };
            }

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
                ? <div>loading...</div>
                : notifications && notifications.length
                    ? notifications.map((notification) => (
                        <div key={notification.id}>

                            {notification.type.name === 'POST' && notification.post && (
                                <>
                                    <NotificationPost post={notification.post as BasePostDataType} isRead={notification.isRead} />
                                    <div className='feed-hr-line'></div>
                                </>
                            )}

                            {notification.type.name === 'REPLY' && notification.post && 'replyTo' in notification.post && notification.post.replyTo && (
                                <>
                                    <NotificationReply post={notification.post as BasePostDataType} isRead={notification.isRead} />
                                    <div className='feed-hr-line'></div>
                                </>
                            )}

                            {notification.type.name === 'REPOST' && notification.post && (
                                <>
                                    {notification.post!.replyTo
                                        ? (
                                            <NotificationRepostedReply post={notification.post as BasePostDataType} notifier={notification.notifier as UserDataType} isRead={notification.isRead} />
                                        )
                                        : (
                                            <NotificationRepostedPost post={notification.post as BasePostDataType} notifier={notification.notifier as UserDataType} isRead={notification.isRead} />
                                        )
                                    }
                                    <div className='feed-hr-line'></div>
                                </>
                            )}

                            {notification.type.name === 'LIKE' && notification.post && (
                                <>
                                    {notification.post!.replyTo
                                        ? (
                                            <NotificationLikedReply post={notification.post as BasePostDataType} notifier={notification.notifier as UserDataType} isRead={notification.isRead} />
                                        )
                                        : (
                                            <NotificationLikedPost post={notification.post as BasePostDataType} notifier={notification.notifier as UserDataType} isRead={notification.isRead} />
                                        )
                                    }
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
                    : notifications === null
                        ? <div>Something went wrong</div>
                        : notifications && !notifications.length && <NotificationsNoContent />
            }

            {!notificationsEndReached && (
                <div ref={ref}>
                    <p>Loading...</p>
                </div>
            )}
        </section>
    )
}
