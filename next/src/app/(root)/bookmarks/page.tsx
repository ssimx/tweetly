import BookmarksContent from '@/components/bookmarks/BookmarksContent';
import { getBookmarks } from "@/data-acess-layer/user-dto";

export default async function Bookmarks() {
    const bookmarks = await getBookmarks();
    
    return (
        <section className='feed-desktop'>
            <BookmarksContent initialBookmarks={bookmarks} />
        </section>
    )
}
