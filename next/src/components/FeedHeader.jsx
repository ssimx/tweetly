import FeedHeaderTabs from './FeedHeaderTabs';
import NewPost from './NewPost';

export default function FeedHeader() {

    return (
        <section className='feed-header pb-2'>
            <div className='flex flex-col'>
                <div className='flex items-center h-[30px]'>
                    <h1 className='text-20 font-bold'>Home</h1>
                </div>
                <FeedHeaderTabs />
            </div>

            <NewPost />
        </section>
    )
}
