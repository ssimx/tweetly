import BookmarkedPost from "@/components/posts/BookmarkedPost";
import { getBookmarks } from "@/data-acess-layer/user-dto";

export default async function Bookmarks() {
    const bookmarks = await getBookmarks();

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            {bookmarks.map((post, index) => (
                <div key={index}>
                    <BookmarkedPost post={post} />
                    <div className='feed-hr-line'></div>
                </div>
            ))}
        </section>
    )
}
