'use client';
import { SetStateAction } from "react";

export default function FeedHeaderTabs({ activeTab, setActiveTab }: { activeTab: number, setActiveTab: React.Dispatch<SetStateAction<number>> }) {

    return (
        <div className='w-[full] h-[50px] flex sticky top-0 bg-white z-10 border-b bg-primary-foreground'>
            <div className='w-full relative flex-center'>
                <button
                    className={`z-10 absolute w-full h-full ${activeTab === 0 ? 'text-primary-text font-bold' : 'text-secondary-text font-medium'}`}
                    onClick={() => setActiveTab(0)} >
                    Global
                </button>

                {activeTab === 0 && (
                    <div className='w-full flex-center'>
                        <div className='w-[50px] h-[4px] absolute rounded-xl bottom-0 bg-primary z-0'></div>
                    </div>
                )}
            </div>

            <div className='w-full relative flex-center'>
                <button
                    className={`z-10 absolute w-full h-full ${activeTab === 1 ? 'text-primary-text font-bold' : 'text-secondary-text font-medium'}`}
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
