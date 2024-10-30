'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { formatPostDate } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'

interface ConversationCardType {
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

interface MessageUserPreviewType {
    username: string;
    profile: {
        name: string;
        profilePicture: string;
    } | null;
};

export default function ConversationCard({ convoId, convo }: { convoId: string, convo: ConversationCardType }) {
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    console.log(convo);
    

    const messageUserPreviewInfo: MessageUserPreviewType = convo.receiver.username === convo.sender.username
        ? convo.receiver   // logged in user self-convo, show their info
        : convo.receiver.username === loggedInUser.username
            ? convo.sender // receiver is logged in user, show sender info
            : convo.receiver // sender is logged in user, show receiver info

    const onConvoClick = () => {
        router.push(`/messages/${convoId}`);
    };

    return (
        <div 
            className={`w-full h-fit px-4 py-4 flex gap-2 hover:bg-card-hover hover:cursor-pointer ${convo.sender.username !== loggedInUser.username && convo.readStatus === false ? 'bg-card-hover group' : null}`}
            onClick={onConvoClick}>
                <div className='min-w-[40px]'>
                    <Image
                        src={`${messageUserPreviewInfo.profile?.profilePicture}`}
                        alt='Conversation user profile picture'
                        height={40} width={40}
                        className='w-[40px] h-[40px] rounded-full' />
                </div>

                <div className='w-full flex flex-col leading-5'>
                    <div className='flex gap-1 text-dark-500'>
                        <p className='font-bold text-black-1'>{messageUserPreviewInfo.profile?.name}</p>
                        <p className=''>@{messageUserPreviewInfo.username}</p>
                        <p>·</p>
                        <p>{formatPostDate(convo.createdAt)}</p>

                        { convo.sender.username !== loggedInUser.username && convo.readStatus === false && (
                            <div className='ml-auto self-center bg-primary rounded-full w-[8px] h-[8px] group-hover:scale-110'></div>
                        )}
                    </div>

                    <div className='message-content-overflow'>
                        <p className='break-all'>{convo.content}</p>
                    </div>
                </div>
        </div>
    )
}
