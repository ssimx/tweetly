'use client';
import { ConversationLastMessageType } from '@/app/(root)/messages/page';
import { useUserContext } from '@/context/UserContextProvider';
import { formatPostDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

interface MessageUserPreviewType {
    username: string;
    profile: {
        name: string;
        profilePicture: string;
    } | null;
};

export default function ConversationCard({ convo }: { convo: ConversationLastMessageType } ) {
    const { loggedInUser } = useUserContext();

    const messageUserPreviewInfo: MessageUserPreviewType = convo.lastMessage.receiver.username === convo.lastMessage.sender.username
        ? convo.lastMessage.receiver   // logged in user self-convo, show their info
        : convo.lastMessage.receiver.username === loggedInUser.username
            ? convo.lastMessage.sender // receiver is logged in user, show sender info
            : convo.lastMessage.receiver // sender is logged in user, show receiver info

    return (
        <Link href={`/messages/${convo.id}`}>
            <div
                className={`w-full min-w-0 h-full px-4 py-4 flex gap-2 hover:bg-card-hover hover:cursor-pointer ${convo.lastMessage.sender.username !== loggedInUser.username && convo.lastMessage.readStatus === false ? 'bg-card-hover group' : null}`}
                >
                    <div className='min-w-[40px]'>
                        <Image
                            src={`${messageUserPreviewInfo.profile?.profilePicture}`}
                            alt='Conversation user profile picture'
                            height={40} width={40}
                            className='w-[40px] h-[40px] rounded-full' />
                    </div>
                    <div className='w-full flex flex-col leading-5 min-w-0'>
                        <div className='flex gap-1 text-dark-500'>
                            <p className='font-bold text-black-1 whitespace-nowrap overflow-hidden'>{messageUserPreviewInfo.profile?.name}</p>
                            <p className=''>@{messageUserPreviewInfo.username}</p>
                            <p>·</p>
                        <p className='whitespace-nowrap'>{formatPostDate(convo.updatedAt)}</p>
                            { convo.lastMessage.sender.username !== loggedInUser.username && convo.lastMessage.readStatus === false && (
                                <div className='ml-auto self-center bg-primary rounded-full w-[8px] h-[8px] group-hover:scale-110'></div>
                            )}
                        </div>
                        <div className='message-content-overflow'>
                        <p className='break-all'>{convo.lastMessage.content}</p>
                        </div>
                    </div>
            </div>
        </Link>
    )
}
