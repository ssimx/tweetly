import FeedContent from "@/components/feed/FeedContent";
import { getHomeGlobalFeed } from "@/data-acess-layer/user-dto";
import { BasicPostType } from "@/lib/types";

export type FeedPostsType = {
    posts: BasicPostType[];
    end: boolean;
} | undefined;

export default async function Feed() {
    const globalFeedPosts = await getHomeGlobalFeed() as FeedPostsType;

    return (
        <section className='feed-desktop'>
            <FeedContent initialPosts={globalFeedPosts} />
        </section>
    )
}
