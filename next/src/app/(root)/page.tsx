import FeedContent from "@/components/feed/FeedContent";
import { getHomeGlobalFeed } from "@/data-acess-layer/user-dto";

export default async function Feed() {
    const globalFeedPosts = await getHomeGlobalFeed();

    return (
        <section className='feed-desktop'>
            <FeedContent initialPosts={globalFeedPosts} />
        </section>
    )
}
