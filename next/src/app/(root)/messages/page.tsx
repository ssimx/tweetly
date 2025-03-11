import ConversationsList from "@/components/messages/ConversationsList";
import { getConversations } from "@/data-acess-layer/user-dto";

export default async function Messages() {
    const response = await getConversations();

    if (!response.success || !response.data) {
        return (
            <section className='feed-desktop'>
                <ConversationsList initialConversations={null} cursor={null} end={true} />
            </section>
        )
    }

    return (
        <section className='w-full h-auto'>
            <ConversationsList initialConversations={response.data.conversations} cursor={response.data.cursor} end={response.data.end} />
        </section >
    )
}
