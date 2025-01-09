'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { formatDate, getAge } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SettingsHeaderInfo from './SettingsHeaderInfo';

export default function AccountInformation() {
    const { loggedInUser } = useUserContext();

    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header='Account information' />
            <div className='feed-hr-line'></div>

            <Link href='/settings/account/information/username' className='flex gap-4 items-center px-4 py-3 hover:bg-post-hover'>
                <div>
                    <h3>Username</h3>
                    <p className='text-14 text-secondary-text'>@{loggedInUser.username}</p>
                </div>
                <ChevronRight size={20} className='ml-auto text-secondary-text min-w-[26px]' />
            </Link>

            <Link href='/settings/account/information/email' className='flex gap-4 items-center px-4 py-3 hover:bg-post-hover'>
                <div>
                    <h3>Email</h3>
                    <p className='text-14 text-secondary-text'>{loggedInUser.email}</p>
                </div>
                <ChevronRight size={20} className='ml-auto text-secondary-text min-w-[26px]' />
            </Link>

            <Link href='/settings/account/information/birthday' className='flex gap-4 items-center px-4 py-3 hover:bg-post-hover'>
                <div>
                    <h3>Date of birth</h3>
                    <p className='text-14 text-secondary-text'>{formatDate(loggedInUser.dateOfBirth)}</p>
                </div>
                <ChevronRight size={20} className='ml-auto text-secondary-text min-w-[26px]' />
            </Link>

            <div className='feed-hr-line'></div>

            <div className='mt-2 px-4 py-2'>
                <h3>Age</h3>
                <p className='text-14 text-secondary-text'>{getAge(loggedInUser.dateOfBirth)}</p>
            </div>

            <div className='px-4 py-2'>
                <h3>Premium user</h3>
                <p className='text-14 text-secondary-text'>No. <Link href='/settings/premium' className='text-primary font-semibold hover:underline'>Learn more</Link></p>
            </div>

            <div className='px-4 py-2'>
                <h3>Account created</h3>
                <p className='text-14 text-secondary-text'>{formatDate(loggedInUser.createdAt)}</p>
            </div>
        </div>
    )
}
