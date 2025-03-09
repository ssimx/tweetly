
import { getNotifications } from "@/data-acess-layer/user-dto";
import NotificationsContent from '@/components/notifications/NotificationsContent';

export default async function Notifications() {
    const response = await getNotifications();

    if (!response.success || !response.data) {
        return (
            <section className='feed-desktop'>
                <NotificationsContent initialNotifications={null} cursor={null} end={true} />
            </section>
        )
    }

    return (
        <section className='feed-desktop'>
            <NotificationsContent initialNotifications={response.data.notifications} cursor={response.data.cursor} end={response.data.end} />
        </section>
    )
}
