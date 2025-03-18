import FeedContent from "@/components/feed/FeedContent";

export default async function Feed() {
    return (
        <section className='grid grid-cols-1 grid-rows-[auto,1fr]'>
            <FeedContent />
        </section>
    )
}
