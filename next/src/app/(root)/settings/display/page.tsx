'use client';
import SettingsHeaderInfo from '@/components/settings/SettingsHeaderInfo';
import React, { useState } from 'react';
import TweetlyLogo from '@/assets/blackWhiteLogo.png';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useDisplayContext } from '@/context/DisplayContextProvider';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import PostText from '@/components/posts/post-parts/PostText';

export default function SettingsDisplay() {
    const { savedTheme, savedColor } = useDisplayContext();
    const [currentColor, setCurrentColor] = useState(savedColor);
    const [currentTheme, setCurrentTheme] = useState(savedTheme);
    const router = useRouter();

    const handleColorChange = async (color: number) => {
        if (color === currentColor) return;
        setCurrentColor(color);
        Cookies.set('color', color.toString(), { path: '/', expires: 365 });
        router.refresh();
    };

    const handleThemeChange = async (theme: number) => {
        if (theme === currentTheme) return;
        setCurrentTheme(theme);
        Cookies.set('theme', theme.toString(), { path: '/', expires: 365 });
        router.refresh();
    };

    return (
        <div className='flex flex-col gap-y-2'>
            <SettingsHeaderInfo header='Display' desc='Manage your primary color and background. These settings affect all the Tweetly accounts on this browser.' />
            <div className='feed-hr-line'></div>
            <div className='w-full flex flex-col gap-2 px-4 pt-3 hover:bg-post-hover cursor-pointer pb-3'>
                <div className='w-full grid grid-cols-post-layout grid-rows-1 gap-2'>
                    <div className='w-auto h-full'>
                        <Link href='/tweetly' className='flex group'>
                            <Image
                                src={TweetlyLogo}
                                alt='Post author profile pic' width={40} height={40} className='w-[40px] h-[40px] bg-contain rounded-full group-hover:outline group-hover:outline-primary/10' />
                        </Link>
                    </div>
                    <div className='w-full flex flex-col min-w-0'>
                        <div className='flex gap-2 text-secondary-text'>
                            <Link href='/tweetly' className='text-primary-text w-fit whitespace-nowrap overflow-hidden font-bold hover:underline'>Tweetly</Link>
                            <p>@Tweetly</p>
                            <p>·</p>
                            <p className='whitespace-nowrap'>13m</p>
                        </div>
                        <div className='w-full min-w-[1%] flex break-words whitespace-normal'>
                            <PostText content={'At the heart of Tweetly are short messages called posts - just like this one - which can include photos, links, text, #hashtags and mentions like @Tweetly'} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='feed-hr-line'></div>
            <div className='px-4 py-3 flex flex-col gap-4'>
                <h1 className='text-20 font-bold'>Color</h1>
                <div className='flex gap-4 justify-evenly'>
                    <button className='h-[40px] w-[40px] flex-center bg-primary-color-blue rounded-full' onClick={() => handleColorChange(0)}>
                        {currentColor === 0 && (
                            <Check size={22} strokeWidth={2} color='#FFFFFF' />
                        )}
                    </button>
                    <button className='h-[40px] w-[40px] flex-center bg-primary-color-yellow rounded-full' onClick={() => handleColorChange(1)}>
                        {currentColor === 1 && (
                            <Check size={22} strokeWidth={2} color='#FFFFFF' />
                        )}
                    </button>
                    <button className='h-[40px] w-[40px] flex-center bg-primary-color-pink rounded-full' onClick={() => handleColorChange(2)}>
                        {currentColor === 2 && (
                            <Check size={22} strokeWidth={2} color='#FFFFFF' />
                        )}
                    </button>
                    <button className='h-[40px] w-[40px] flex-center bg-primary-color-purple rounded-full' onClick={() => handleColorChange(3)}>
                        {currentColor === 3 && (
                            <Check size={22} strokeWidth={2} color='#FFFFFF' />
                        )}
                    </button>
                    <button className='h-[40px] w-[40px] flex-center bg-primary-color-orange rounded-full' onClick={() => handleColorChange(4)}>
                        {currentColor === 4 && (
                            <Check size={22} strokeWidth={2} color='#FFFFFF' />
                        )}
                    </button>
                </div>
            </div>
            <div className='feed-hr-line'></div>
            <div className='px-4 py-3 flex flex-col gap-4'>
                <h1 className='text-20 font-bold'>Background</h1>
                <div className='w-full flex gap-3'>
                    <button className={`flex-grow w-0 h-[60px] bg-primary-theme-white rounded-sm flex-center gap-2 font-bold ${currentTheme === 0 && 'outline outline-primary'}`} onClick={() => handleThemeChange(0)}>
                        <div className={`h-[24px] w-[24px] rounded-full flex-center ${currentTheme !== 0 ? 'border-[2px] border-stone-400' : 'bg-primary'}`}>
                            {currentTheme === 0 && (
                                <Check size={16} strokeWidth={3} color='#FFFFFF' />
                            )}
                        </div>
                        <p className='text-primary-text-color-black'>Default</p>
                    </button>
                    <button className={`flex-grow w-0 h-[60px] bg-primary-theme-dim rounded-sm flex-center gap-2 font-bold ${currentTheme === 1 && 'outline outline-primary'}`} onClick={() => handleThemeChange(1)}>
                        <div className={`h-[24px] w-[24px] rounded-full flex-center ${currentTheme !== 1 ? 'border-[2px] border-stone-400' : 'bg-primary'}`}>
                            {currentTheme === 1 && (
                                <Check size={16} strokeWidth={3} color='#FFFFFF' />
                            )}
                        </div>
                        <p className='text-primary-text-color-white'>Dim</p>
                    </button>
                    <button className={`flex-grow w-0 h-[60px] bg-primary-theme-dark rounded-sm flex-center gap-2 font-bold ${currentTheme === 2 && 'outline outline-primary'}`} onClick={() => handleThemeChange(2)}>
                        <div className={`h-[24px] w-[24px] rounded-full flex-center ${currentTheme !== 2 ? 'border-[2px] border-stone-400' : 'bg-primary'}`}>
                            {currentTheme === 2 && (
                                <Check size={16} strokeWidth={3} color='#FFFFFF' />
                            )}
                        </div>
                        <p className='text-primary-text-color-white'>Dark</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
