import ConversationContent from "@/components/messages/ConversationContent";
import ConversationHeader from "@/components/messages/ConversationHeader";
import { getConversationById, getLoggedInUser } from "@/data-acess-layer/user-dto";

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
};

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

export default async function Conversation(props: { params: Promise<{ conversationId: string }> }) {
    const params = await props.params;
    const convo = await getConversationById(params.conversationId);
    const user = await getLoggedInUser();

    // // filter out user on the other side of the conversation
    const receiver = convo.conversation.participants.filter((participant) => participant.user.username !== user.username);
    // // if both participants share username with logged in user, it's self-conversation
    const receiverInfo: ReceiverType = receiver.length === 1 ? receiver[0].user : convo.conversation.participants[0].user;

    return (
        <div className='' style={{ height: 'calc(100vh - var(--header-size))' }}>
            <ConversationHeader receiverInfo={receiverInfo} />
            <ConversationContent receiverInfo={receiverInfo} convo={convo} />
        </div>
    )
}
