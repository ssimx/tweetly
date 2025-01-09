import { AllMessagesType } from "./ConversationContent";

interface MessageBubbleType {
    msg: AllMessagesType,
    index: number,
    allMessagesOrdered: AllMessagesType[],
    sender?: boolean
}

export default function MessageBubble({ msg, index, allMessagesOrdered, sender = false }: MessageBubbleType) {
    const isFirst = index === 0;
    const isLast = index === allMessagesOrdered.length - 1;
    const prevMsgSameSender = !isFirst && allMessagesOrdered[index - 1].sender === sender;
    const nextMsgSameSender = !isLast && allMessagesOrdered[index + 1].sender === sender;

    const bubbleClasses = !sender
        ? `w-fit mr-auto bg-secondary-foreground text-white p-3 ${prevMsgSameSender ? 'rounded-tl-none' : `rounded-tl-[25px] ${!isFirst && 'mt-4'}`} ${nextMsgSameSender ? 'rounded-bl-none' : 'rounded-bl-[25px]'} rounded-r-[25px]`
        : `w-fit ml-auto bg-primary text-primary-text p-3 ${prevMsgSameSender ? 'rounded-tr-none' : `rounded-tr-[25px] ${!isFirst && 'mt-4'}`} ${nextMsgSameSender ? 'rounded-br-none' : 'rounded-br-[25px]'} rounded-l-[25px]`;

    return <div className={bubbleClasses}>{msg.content}</div>;
}
