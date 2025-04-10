'use client';
import { useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import Image from "next/image";
import { ConversationType } from 'tweetly-shared';

export default function ConversationHeader({ receiverInfo }: { receiverInfo: Pick<ConversationType, 'participants'>['participants'][0] }) {
    const router = useRouter();

    const handleBackClick = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className='h-header w-full flex items-center gap-6 px-2 absolute bg-primary-foreground z-[500]'>
            <button onClick={handleBackClick}>
                <ArrowLeft size={22} />
            </button>
            <div className='text-20 font-bold flex gap-2 items-center w-full'>
                <Image
                    src={receiverInfo.profile.profilePicture}
                    alt='Receivers profile picture'
                    height={35} width={35}
                    className='h-[35px] w-[35px] rounded-full' />
                <h1 className='text-20 font-bold'>{receiverInfo.username}</h1>
            </div>
        </div>
    )
}
