import SettingsHeaderInfo from '@/components/settings/SettingsHeaderInfo';
import { ChevronRight, User, KeyRound, HeartCrack } from 'lucide-react';
import Link from 'next/link';

export default function AccountSettings() {
    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header='Your account' desc='See information about your account, change account information, or learn about your account deactivation options' />
            <div className='feed-hr-line'></div>
            <div className='flex flex-col'>
                <Link href='/settings/account/information' className='flex gap-4 items-center px-4 py-3 hover:bg-card-hover'>
                    <User size={20} className='text-gray-500 min-w-[24px]'/>
                    <div>
                        <h3>Account information</h3>
                        <p className='text-14 text-gray-500'>See your account information like your username and email address.</p>
                    </div>
                    <ChevronRight size={20} className='ml-auto text-gray-500 min-w-[26px]' />
                </Link>

                <Link href='/settings/account/password' className='flex gap-4 items-center px-4 py-3 hover:bg-card-hover'>
                    <KeyRound size={20} className='text-gray-500 min-w-[24px]' />
                    <div>
                        <h3>Change your password</h3>
                        <p className='text-14 text-gray-500'>Change your password at any time.</p>
                    </div>
                    <ChevronRight size={20} className='ml-auto text-gray-500 min-w-[26px]' />
                </Link>

                <Link href='/settings/account/deactivate' className='flex gap-4 items-center px-4 py-3 hover:bg-card-hover'>
                    <HeartCrack size={20} className='text-gray-500 min-w-[24px]' />
                    <div>
                        <h3>Deactivate your account</h3>
                        <p className='text-14 text-gray-500'>Find out how you can deactivate your account.</p>
                    </div>
                    <ChevronRight size={20} className='ml-auto text-gray-500 min-w-[26px]' />
                </Link>
            </div>
        </div>
    )
}
