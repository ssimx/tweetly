'use client';
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import { ReceiverType } from "@/app/(root)/messages/[conversationId]/page";
import Image from "next/image";
import { CircleEllipsis } from 'lucide-react';

export default function ConversationHeader({ receiverInfo }: { receiverInfo: ReceiverType }) {
    const path = usePathname();
    const router = useRouter();

    const handleBackClick = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className='h-header flex items-center gap-6 px-2'>
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
                <CircleEllipsis size={20} className='text-dark-600 ml-auto' />
            </div>
        </div>
    )
}
