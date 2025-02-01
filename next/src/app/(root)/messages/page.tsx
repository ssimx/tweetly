
import SearchInput from "@/components/messages/ConversationSearchInput";
import { getConversations } from "@/data-acess-layer/user-dto";

export default async function Messages() {
    const conversations = await getConversations();

    return (
        <section className='w-full h-auto'>
            <SearchInput messages={conversations} />
        </section >
    )
}
