import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation";

export default async function Feed() {
    const session = await verifySession();
    if (!session.isAuth) redirect('/login');

    return (
        <div>
            Feed
        </div>
    )
}
