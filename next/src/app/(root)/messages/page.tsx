
import SearchInput from "@/components/messages/SearchInput";
import { decryptSession, getToken } from "@/lib/session";
import { redirect } from "next/navigation";



export interface ConversationLastMessageType {
    id: string,
    participants: {
        userA: string,
        userB: string,
    },
    updatedAt: string,
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
    },
};

export interface MessagesType {
    conversations: ConversationLastMessageType[],
    end: boolean,
};

export default async function Messages() {
    const token = await getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const response = await fetch(`http://localhost:3000/api/conversations/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const messages = await response.json() as MessagesType;

    console.log(messages);

    return (
        <section className='w-full h-auto'>
            <SearchInput messages={messages} />
        </section >
    )
}
