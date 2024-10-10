import FeedHeaderTabs from './FeedHeaderTabs';
import NewPost from './NewPost';

export default function FeedHeader() {

    return (
        <section className='feed-header'>
            <FeedHeaderTabs />

            <NewPost />
        </section>
    )
}
