import { redirect } from "next/navigation";
import { getToken, verifySession } from "@/lib/session";
import FeedContent from "@/components/feed/FeedContent";

export default async function Feed() {
    const token = await getToken();
    const isAuth = await verifySession(token).then(res => res.isAuth);
    if (!isAuth) redirect('/login');

    return (
        <section className='feed-desktop'>
            <FeedContent />
        </section>
    )
}
