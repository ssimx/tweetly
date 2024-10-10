import { redirect } from "next/navigation";
import { getToken, verifySession } from "@/lib/session";
import FeedHeader from '@/components/feed/FeedHeader';
import FeedContent from "@/components/feed/FeedContent";

export default async function Feed() {
    const token = getToken();
    const isAuth = await verifySession(token).then(res => res.isAuth);
    if (!isAuth) redirect('/login');

    return (
        <section className='feed-desktop'>
            <FeedHeader />
            <FeedContent />
        </section>
    )
}
