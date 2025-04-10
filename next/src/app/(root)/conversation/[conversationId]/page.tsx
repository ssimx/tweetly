import ConversationContent from "@/components/messages/ConversationContent";
import { getConversationById } from "@/data-acess-layer/user-dto";
import { redirect } from 'next/navigation';

export interface MessageType {
    id: string,
    content: string,
    readStatus: boolean,
    createdAt: string,
    updatedAt: string,
    sender: {
        username: string
    }
};

export default async function Conversation(props: { params: Promise<{ conversationId: string }> }) {
    const params = await props.params;
    const response = await getConversationById(params.conversationId);

    if (!response.success || !response.data) {
        redirect('/');
    }

    const { conversation } = response.data;

    return (
        <ConversationContent conversation={conversation} />
    )
}
