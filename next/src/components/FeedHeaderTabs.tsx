'use client';

import { useState } from "react";

export default function FeedHeaderTabs() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className='w-full h-[50px] flex'>
            <div className='feed-header-tab-btn relative'>
                <button
                    className={`z-10 absolute w-full h-full ${activeTab === 0 ? 'text-black-1 font-bold' : 'text-dark-500 font-medium'}`}
                    onClick={() => setActiveTab(0)} >
                    Global
                </button>

                {activeTab === 0 && (
                    <div className='w-full flex-center'>
                        <div className='w-[50px] h-[4px] absolute rounded-xl bottom-0 bg-primary z-0'></div>
                    </div>
                )}
            </div>

            <div className='feed-header-tab-btn relative'>
                <button
                    className={`z-10 absolute w-full h-full ${activeTab === 1 ? 'text-black-1 font-bold' : 'text-dark-500 font-medium'}`}
                    onClick={() => setActiveTab(1)} >
                    Following
                </button>

                {activeTab === 1 && (
                    <div className='w-full flex-center'>
                        <div className='w-[77px] h-[4px] absolute rounded-xl bottom-0 bg-primary z-0'></div>
                    </div>
                )}
            </div>
        </div>
    )
}
