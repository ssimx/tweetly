'use client';
import { useUserContext } from '@/context/UserContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import PostDate from '../posts/post-parts/PostDate';
import { ConversationCardType } from 'tweetly-shared';

export default function ConversationCard({ conversation }: { conversation: ConversationCardType }) {
    const { loggedInUser } = useUserContext();

    if (conversation.lastMessage === null) {
        return (
            <></>
        )
    }

    const messageUserPreviewInfo = conversation.lastMessage.receiver.username === conversation.lastMessage.sender.username
        ? conversation.lastMessage.receiver   // logged in user self-conversation, show their info
        : conversation.lastMessage.receiver.username === loggedInUser.username
            ? conversation.lastMessage.sender // receiver is logged in user, show sender info
            : conversation.lastMessage.receiver; // sender is logged in user, show receiver info

    return (
        <Link href={`/messages/${conversation.id}`}>
            <div
                className={`w-full min-w-0 h-full px-4 py-4 flex gap-2 hover:bg-card-hover hover:cursor-pointer ${conversation.lastMessage.sender.username !== loggedInUser.username && conversation.lastMessage.readAt === undefined ? 'bg-post-hover group' : null}`}
            >
                <div className='min-w-[40px]'>
                    <Image
                        src={`${messageUserPreviewInfo.profile.profilePicture}`}
                        alt='Conversation user profile picture'
                        height={40} width={40}
                        className='w-[40px] h-[40px] rounded-full' />
                </div>
                <div className='w-full flex flex-col leading-5 min-w-0'>
                    <div className='flex gap-1 text-secondary-text'>
                        <p className='font-bold text-primary-text whitespace-nowrap overflow-hidden'>{messageUserPreviewInfo.profile?.name}</p>
                        <p className=''>@{messageUserPreviewInfo.username}</p>
                        <p>·</p>
                        <PostDate createdAt={conversation.lastMessage.createdAt} />
                        {conversation.lastMessage.sender.username !== loggedInUser.username && conversation.lastMessage.readAt === undefined && (
                            <div className='ml-auto self-center bg-primary rounded-full w-[8px] h-[8px] group-hover:scale-110'></div>
                        )}
                    </div>
                    <div className='message-content-overflow'>
                        {conversation.lastMessage.images && conversation.lastMessage.images.length
                            ? (
                                <p className='text-secondary-text italic'>Sent an image</p>

                            )
                            : (
                                <p className='break-all'>
                                    {conversation.lastMessage.sender.username !== loggedInUser.username
                                        && (
                                        <span className='text-secondary-text'>{conversation.lastMessage.sender.username}: </span>
                                        )
                                    }
                                    {conversation.lastMessage.content}</p>
                            )}
                    </div>
                </div>
            </div >
        </Link >
    )
}

