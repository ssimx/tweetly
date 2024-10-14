'use client';
import { Mail } from "lucide-react";
import Link from "next/link";

export default function ProfileMessageBtn({ username }: { username: string }) {

    return (
        <Link href={`/messages/${username}`} className='message-btn'>
            <Mail size={20} className='text-black-1' />
        </Link>
    )
}
