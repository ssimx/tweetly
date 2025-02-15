import { getHomeGlobalFeed } from '@/actions/get-actions';
import FeedContent from "@/components/feed/FeedContent";

export default async function Feed() {
    const globalFeedPosts = await getHomeGlobalFeed();

    return (
        <section className='feed-desktop'>
            <FeedContent initialPosts={globalFeedPosts} />
        </section>
    )
}
