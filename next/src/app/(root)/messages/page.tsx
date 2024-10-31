
import SearchInput from "@/components/messages/SearchInput";
import { decryptSession, getToken } from "@/lib/session";
import { redirect } from "next/navigation";

export interface ConversationLastMessageType {
    conversationId: string,
    lastMessage: {
        id: string,
        content: string,
        createdAt: string;
        readStatus: boolean,
        sender: {
            username: string;
            profile: {
                name: string;
                profilePicture: string;
            } | null;
        };
        receiver: {
            username: string;
            profile: {
                name: string;
                profilePicture: string;
            } | null;
        }
    }
};

export default async function Messages() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const response = await fetch(`http://localhost:3000/api/conversations/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const conversations = await response.json() as ConversationLastMessageType[];

    return (
        <section className='w-full h-fit'>
            <SearchInput conversations={conversations} />
        </section >
    )
}
