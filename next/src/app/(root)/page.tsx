import { getHomeGlobalFeed } from '@/actions/get-actions';
import FeedContent from "@/components/feed/FeedContent";

export default async function Feed() {
    const response = await getHomeGlobalFeed();

    if (!response.success || response.data?.posts === undefined) {
        return (
            <section className='feed-desktop'>
                <FeedContent initialPosts={undefined} />
            </section>
        )
    }

    const { data } = response;
    
    return (
        <section className='feed-desktop'>
            <FeedContent initialPosts={data} />
        </section>
    )
}
