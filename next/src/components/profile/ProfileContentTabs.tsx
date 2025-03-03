import { profileContentTabs } from '@/constants';
import { SetStateAction } from 'react';

type ProfileContentTabsProps = {
    activeTab: number,
    setActiveTab: React.Dispatch<SetStateAction<number>>,
    authorized: boolean,
};

export default function ProfileContentTabs({ activeTab, setActiveTab, authorized }: ProfileContentTabsProps) {
    const tabs = profileContentTabs.map((tab) => tab);
    // If profile is not logged in user, remove Likes tab (private)
    !authorized && tabs.pop();

    return (
        <div className='profile-content-header'>
            {
                tabs.map((tab, index) => (
                    <div key={index} className='profile-content-header-btn'>
                        <button
                            className={`w-full h-full z-10 absolute ${activeTab === index ? 'text-primary-text font-bold' : 'text-secondary-text font-medium'}`}
                            onClick={() => setActiveTab(index)}>
                            {tab.name}
                        </button>

                        {activeTab === index && (
                            <div className='w-full flex-center'>
                                <div className='h-[4px] absolute rounded-xl bottom-0 bg-primary z-0'
                                    style={{ width: `${tab.name.length}ch` }}></div>
                            </div>
                        )}
                    </div>
                ))
            }
        </div>
    )
}
