
import NotificationPost from "@/components/notifications/NotificationPost";
import NotificationNewFollow from "@/components/notifications/NotificationNewFollow";
import { getNotifications } from "@/data-acess-layer/user-dto";

export default async function Notifications() {
    const notifications = await getNotifications();

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            {notifications.map((item, index) => (
                <div key={index}>
                    {
                        item.type.name !== 'FOLLOW'
                            ? (
                                <>
                                    <NotificationPost
                                        post={item.post}
                                        type={item.type}
                                        isRead={item.isRead}
                                        notifier={item.notifier} />
                                    <div className='feed-hr-line'></div>
                                </>
                            )
                            : (
                                <>
                                    <NotificationNewFollow isRead={item.isRead} notifier={item.notifier} />
                                    <div className='feed-hr-line'></div>
                                </>
                            )
                    }

                </div>
            ))}
        </section >
    )
}
