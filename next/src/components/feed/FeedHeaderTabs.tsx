'use client';
import { ArrowUp } from 'lucide-react';
import Image from 'next/image';
import { SetStateAction } from "react";
import { BasePostDataType } from 'tweetly-shared';

type FeedHeaderTabsType = {
    activeTab: number,
    setActiveTab: React.Dispatch<SetStateAction<number>>,
    newGlobalPosts: BasePostDataType[],
    newFollowingPosts: BasePostDataType[],
    isNewPostsIndicatorVisible: boolean,
};

export default function FeedHeaderTabs({ activeTab, setActiveTab, newGlobalPosts, newFollowingPosts, isNewPostsIndicatorVisible }: FeedHeaderTabsType) {

    return (
        <div className='w-[98%] h-[50px] sticky top-0 mx-auto bg-white z-10 border-b bg-primary-foreground'>
            <div className='relative w-full h-full flex'>
                <div className='relative w-full flex-center'>
                    <button
                        className={`z-10 absolute w-full h-full hover:bg-card-hover ${activeTab === 0 ? 'text-primary-text font-bold' : 'text-secondary-text font-medium'}`}
                        onClick={() => setActiveTab(0)} >
                        Global
                    </button>
                    {activeTab === 0 && (
                        <div className='w-full flex-center'>
                            <div className='w-[50px] h-[4px] absolute rounded-xl bottom-0 bg-primary z-20'></div>
                        </div>
                    )}
                </div>
                <div className='relative w-full flex-center'>
                    <button
                        className={`z-10 absolute w-full h-full hover:bg-card-hover ${activeTab === 1 ? 'text-primary-text font-bold' : 'text-secondary-text font-medium'}`}
                        onClick={() => setActiveTab(1)} >
                        Following
                    </button>
                    {activeTab === 1 && (
                        <div className='w-full flex-center'>
                            <div className='w-[77px] h-[4px] absolute rounded-xl bottom-0 bg-primary z-20'></div>
                        </div>
                    )}
                </div>

                {isNewPostsIndicatorVisible === true && (newGlobalPosts.length || newFollowingPosts.length) && (
                    <button
                        className='absolute z-50 top-0 left-1/2 -translate-x-1/2 translate-y-[200%] flex items-center bg-primary rounded-[25px] w-inherit h-fit px-2 py-1 pr-4'
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <ArrowUp size={18} className='text-white-1 mr-1 xl:size-[22px]' />

                        {activeTab === 0 && newGlobalPosts && newGlobalPosts.length && (
                            newGlobalPosts.slice(0, 3).map((post) => (
                                <Image
                                    src={post.author.profile.profilePicture}
                                    alt='New post author profile picture'
                                    width={20} height={20}
                                    className='rounded-full -mr-1 z-30 xl:size-[30px]'
                                    key={post.id}
                                />
                            ))
                        )}

                        {activeTab === 1 && newFollowingPosts && newFollowingPosts.length && (
                            newFollowingPosts.slice(0, 3).map((post) => (
                                <Image
                                    src={post.author.profile.profilePicture}
                                    alt='New post author profile picture'
                                    width={20} height={20}
                                    className='rounded-full -mr-1 z-30 xl:size-[30px]'
                                    key={post.id}
                                />
                            ))
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
