
import { getNotifications } from "@/data-acess-layer/user-dto";
import NotificationsContent from '@/components/notifications/NotificationsContent';

export default async function Notifications() {
    const notifications = await getNotifications();

    return (
        <section className='feed-desktop'>
            <NotificationsContent initialNotifications={notifications} />
        </section>
    )
}
