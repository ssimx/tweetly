import { redirect } from "next/navigation";
import { getToken, verifySession } from "@/lib/session";

export default async function Feed() {
    const token = getToken();
    const isAuth = await verifySession(token).then(res => res.isAuth);
    if (!isAuth) redirect('/login');

    return (
        <section className='feed-desktop'>
            Feed
        </section>
    )
}
