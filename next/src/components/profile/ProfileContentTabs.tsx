import { profileContentTabs } from '@/constants';
import { SetStateAction } from 'react';

export default function ProfileContentTabs({ 
    activeTab,
    setActiveTab,
    loggedInUser
}: { activeTab: number, setActiveTab: React.Dispatch<SetStateAction<number>>, loggedInUser: boolean }) {
    const tabs: { name: string }[] = JSON.parse(JSON.stringify(profileContentTabs));
    !loggedInUser && tabs.pop();

    return (
        <div className='profile-content-header'>
            {
                tabs.map((tab, index) => (
                    <div key={index} className='profile-content-header-btn'>
                        <button
                            className={`w-full h-full z-10 absolute ${activeTab === index ? 'text-black-1 font-bold' : 'text-dark-500 font-medium'}`}
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
