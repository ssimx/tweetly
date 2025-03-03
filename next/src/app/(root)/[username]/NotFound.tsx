import React from 'react';

export default async function NotFound({ username }: { username: string }) {
    return (
        <section className='w-full h-screen grid grid-rows-[max-content,1fr]'>
            <div className='w-full h-[280px]'>
                <div className='h-[200px] relative'>
                    <div className='h-[150px] w-[150px] absolute bottom-0 left-5 translate-y-[50%] rounded-full border-primary-foreground border-4 bg-gray-700' />
                    <div className='w-full h-full bg-gray-500' />
                </div>
            </div>
            <div className='px-4 flex flex-col gap-2'>
                <div>
                    <p className='font-bold text-[1.5rem]'>@{username}</p>
                </div>
            </div>

            <div className='flex flex-col justify-center mx-auto mb-[50%]'>
                <p className='text-[2rem] font-bold'>This account doesn&apos;t exist</p>
                <p className='text-secondary-text'>Try searching for another.</p>
            </div>
        </section>
    )
}
