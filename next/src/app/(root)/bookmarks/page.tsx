import BookmarksContent from '@/components/bookmarks/BookmarksContent';
import { getBookmarks } from "@/data-acess-layer/user-dto";

export default async function Bookmarks() {
    const response = await getBookmarks();

    console.log(response)

    if (!response.success || !response.data) {
        return (
            <section className='feed-desktop'>
                <BookmarksContent initialBookmarks={null} cursor={null} end={true} />
            </section>
        )
    }

    return (
        <section className='feed-desktop'>
            <BookmarksContent initialBookmarks={response.data.bookmarks} cursor={response.data.cursor} end={response.data.end} />
        </section>
    )
}
