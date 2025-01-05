import ConversationContent from "@/components/messages/ConversationContent";
import ConversationHeader from "@/components/messages/ConversationHeader";
import { decryptSession, getToken } from "@/lib/session";
import { redirect } from "next/navigation";

export interface ConversationType {
    id: string,
    participants: {
        user: {
            username: string,
            createdAt: string,
            profile: {
                profilePicture: string,
                name: string,
                bio: string,
            },
            _count: {
                followers: number,
            }
        }
    }[],
    messages: {
        id: string,
        content: string,
        readStatus: boolean,
        createdAt: string,
        updatedAt: string,
        sender: {
            username: string
        }
    }[] | [],
    end: boolean,
}

export interface ParticipantType {
    username: string,
    createdAt: string,
    profile: {
        profilePicture: string,
        name: string,
        bio: string,
    },
    _count: {
        followers: number,
    }
}

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

export interface ReceiverType {
    username: string;
    createdAt: string;
    profile: {
        profilePicture: string;
        name: string;
        bio: string;
    };
    _count: {
        followers: number;
    };
};

export default async function Conversation({ params }: { params: { conversationId: string } }) {
    const token = await getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const response = await fetch(`http://localhost:3000/api/conversations/${params.conversationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });
    const conversation = await response.json() as ConversationType;
    if (!conversation.participants.some(participant => participant.user.username === payload.username)) return redirect('/');

    console.log(conversation);


    // filter out user on the other side of the conversation
    const receiver = conversation.participants.filter((participant) => participant.user.username !== payload.username);
    // if both participants share username with logged in user, it's self-conversation
    const receiverInfo: ReceiverType = receiver.length === 1 ? receiver[0].user : conversation.participants[0].user;

    return (
        <div className='' style={{ height: 'calc(100vh - var(--header-size))' }}>
            <ConversationHeader receiverInfo={receiverInfo} />
            <ConversationContent receiverInfo={receiverInfo} conversation={conversation} />
        </div>
    )
}
