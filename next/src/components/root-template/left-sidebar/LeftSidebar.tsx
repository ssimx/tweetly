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

export default function LeftSidebar() {
    const [newNotification, setNewNotification] = useState(false);
    const { loggedInUser } = useUserContext();

    useEffect(() => {
        socket.connect();

        // After connecting, tell the server which users this user has notifications on for
        socket.emit('get_notifications', loggedInUser.id);

        return () => {
            socket.disconnect();
        };
    }, [loggedInUser]);

    useEffect(() => {
        const onNewNotification = () => {
            setNewNotification(true);
        };

        const onNewMessages = () => {
        };

        const initializeNotificationsStatus = (status: boolean) => {
            setNewNotification(status);
        };

        socket.on('notification_read_status', (status) => {
            initializeNotificationsStatus(status);
        })
        socket.on('new_notification', onNewNotification);
        socket.on('new_message', onNewMessages);

        return () => {
            socket.off('notification_read_status', initializeNotificationsStatus)
            socket.off('new_notification', onNewNotification);
            socket.off('new_message', onNewMessages);
        };
    }), [];
    
    return (
        <nav className='left-sidebar'>
            <Link href='/'>
                <Image src='/blackLogo.png' alt='Tweetly logo' width='30' height='30' className='mx-auto' />
            </Link>
            <div className='left-sidebar-links'>
                {leftSidebarLinks.map((link, index) => (
                    <LeftSidebarLink 
                        key={index} 
                        link={link}
                        newNotification={newNotification} />
                ))}
            </div>

            <NewPostModal />

            <SidebarUserBtn />
        </nav>
    )
}

