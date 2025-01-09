import React from 'react';
import { settingsTabs } from '@/constants';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
    return (
        <div className='flex flex-col'>
            {settingsTabs.map((tab, index) => (
                <Link href={tab.route} key={index} className='flex px-4 py-3 text-start hover:bg-post-hover'>
                    <p>{tab.name}</p>
                    <ChevronRight className='ml-auto text-secondary-text' />
                </Link>
            ))}
        </div>
    )
}
