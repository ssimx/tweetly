import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsNoContent() {
    return (
        <div className='w-full h-full flex flex-col mx-auto mt-[75px]'>
            <div className='flex flex-col items-center gap-4'>
                <div className='w-fit h-fit p-10 rounded-full bg-secondary-foreground'>
                    <Bell size={50} className='text-primary' />
                </div>
                 <p className='text-secondary-text'>You currently have no notifications</p>
            </div>
        </div>
    )
}
