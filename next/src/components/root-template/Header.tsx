'use client';
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import Search from '@/components/misc/Search';
import Link from 'next/link';
import Image from 'next/image';
import { useUserContext } from '@/context/UserContextProvider';
import { useDisplayContext } from '@/context/DisplayContextProvider';
import TweetlyLogoWhite from '@public/white.png';
import TweetlyLogoBlack from '@public/black.png';

export default function TemplateHeader({ setSidebarOpen }: { setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const path = usePathname();
    const router = useRouter();
    const { loggedInUser } = useUserContext();
    const { savedTheme } = useDisplayContext();

    const handleBackClick = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    // don't include in conversation, has it's own implementation
    if (/^\/conversation\/.+/.test(path)) return <></>;

    // PATHS WITH PROFILE PICTURE ICON

    if (path === '/') {
        return (
            <div className='h-header px-5'>
                <div className='h-full w-full flex-center relative xs:hidden'>
                    <button
                        className='absolute left-0'
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Image
                            src={loggedInUser.profile.profilePicture}
                            alt='User profile picture'
                            width={100} height={100}
                            className='w-[30px] h-[30px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </button>
                    <Link href='/' className=''>
                        <Image src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite} alt='Tweetly logo' width='30' height='30' className='mx-auto' />
                    </Link>
                </div>
                <h1 className='hidden w-full h-full xs:flex items-center text-20 font-bold'>Home</h1>
            </div>
        )
    }

    const pathName = path.slice(1);

    if (pathName === 'notifications' || pathName === 'messages' || pathName === 'bookmarks') {
        return (
            <div className='h-header px-5'>
                <div className='h-full w-full flex-center gap-4 relative'>
                    <button
                        className='absolute left-0 xs:hidden'
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Image
                            src={loggedInUser.profile.profilePicture}
                            alt='User profile picture'
                            width={100} height={100}
                            className='w-[30px] h-[30px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </button>

                    <button className='hidden xs:block' onClick={handleBackClick}>
                        <ArrowLeft size={22} />
                    </button>

                    <h1 className='text-20 font-bold mx-auto xs:mx-0 xs:mr-auto'>{`${pathName.charAt(0).toUpperCase() + pathName.slice(1)}`}</h1>
                </div>
            </div>
        )
    }

    if (pathName === 'explore' || pathName === 'search') {
        return (
            <div className='h-header px-5'>
                <div className='h-full w-full flex-center gap-4 relative'>
                    <button
                        className='absolute left-0 xs:hidden'
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Image
                            src={loggedInUser.profile.profilePicture}
                            alt='User profile picture'
                            width={100} height={100}
                            className='w-[30px] h-[30px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </button>

                    <button className='hidden xs:block' onClick={handleBackClick}>
                        <ArrowLeft size={22} />
                    </button>

                    <h1 className='hidden text-20 font-bold mr-auto md:block'>{`${pathName.charAt(0).toUpperCase() + pathName.slice(1)}`}</h1>

                    <div className='min-w-0 w-[65%] max-w-[300px] [&_label]:h-[40px] xs:ml-auto'>
                        <Search />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='h-header px-5'>
            <div className='h-full w-full relative flex justify-center items-center xs:justify-start xs:static gap-6'>
                <button className='absolute left-0 xs:static' onClick={handleBackClick}>
                    <ArrowLeft size={22} />
                </button>
                {pathName.includes('status')
                    ? (
                        <h1 className='text-20 font-bold text-center'>Post</h1>
                    )
                    : pathName.includes('followers') || pathName.includes('following')
                        ? (
                            <h1 className='text-20 font-bold'>{`${pathName.charAt(0).toUpperCase() + pathName.slice(1, pathName.indexOf('/'))}`}</h1>
                        )
                        : pathName.includes('settings')
                            ? (
                                <h1 className='text-20 font-bold'>Settings</h1>
                            )
                            : (
                                <h1 className='text-20 font-bold'>{`${pathName.charAt(0).toUpperCase() + pathName.slice(1)}`}</h1>
                            )

                }
                {(pathName.startsWith('search') || pathName.startsWith('explore')) && (
                    <div className='min-w-0 [&_label]:h-[40px]'>
                        <Search />
                    </div>
                )}
            </div>
        </div>
    )
}
