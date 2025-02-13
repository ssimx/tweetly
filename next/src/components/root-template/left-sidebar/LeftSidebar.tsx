'use client';
import { leftSidebarLinks } from '@/constants';
import Link from 'next/link';
import Image from 'next/image';
import SidebarUserBtn from './SidebarUserBtn';
import NewPostModal from './NewPostModal';
import LeftSidebarLink from './LeftSidebarLink';
import { useEffect, useState } from 'react';
import { useUserContext } from '@/context/UserContextProvider';
import { socket } from '@/lib/socket';
import TweetlyLogoWhite from '@public/white.png';
import TweetlyLogoBlack from '@public/black.png';
import { useDisplayContext } from '@/context/DisplayContextProvider';

export default function LeftSidebar() {
    const [notifications, setNotifications] = useState(false);
    const [messages, setMessages] = useState(false);
    const { loggedInUser } = useUserContext();
    const { savedTheme } = useDisplayContext();

    useEffect(() => {
        const onNewNotification = () => {
            setNotifications(true);
        };

        const onNewMessages = () => {
            setMessages(true);
        };

        const initializeNotificationsStatus = (status: boolean) => {
            setNotifications(status);
        };

        const initializeMessagesStatus = (status: boolean) => {
            setMessages(status);
        };

        socket.on('notification_read_status', (status) => {
            initializeNotificationsStatus(status);
        });
        socket.on('message_read_status', (status) => {
            initializeMessagesStatus(status);
        });
        socket.on('new_notification', onNewNotification);
        socket.on('new_message', onNewMessages);

        return () => {
            socket.off('notification_read_status', initializeNotificationsStatus);
            socket.off('message_read_status', initializeNotificationsStatus);
            socket.off('new_notification', onNewNotification);
            socket.off('new_message', onNewMessages);
        };
    }), [];

    useEffect(() => {
        socket.connect();

        // After connecting, tell the server which users this user has notifications on for
        socket.emit('get_notifications', loggedInUser.id);

        return () => {
            socket.disconnect();
        };
    }, [loggedInUser]);
    
    return (
        <nav className='left-sidebar'>
            <Link href='/'>
                <Image src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite} alt='Tweetly logo' width='30' height='30' className='mx-auto' />
            </Link>
            <div className='left-sidebar-links'>
                {leftSidebarLinks.map((link) => (
                    <LeftSidebarLink 
                        key={link.label} 
                        link={link}
                        messages={messages}
                        notifications={notifications} />
                ))}
            </div>

            <NewPostModal />

            <SidebarUserBtn />
        </nav>
    )
}

