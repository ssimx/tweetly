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

export default function TemplateHeader() {
    const path = usePathname();
    const router = useRouter();
    const { loggedInUser } = useUserContext();
    const { savedTheme } = useDisplayContext();

    // don't include in messages, has it's own implementation
    if (/^\/messages\/.+/.test(path)) return <></>;

    if (path === '/') {
        return (
            <div className='h-fit px-5 pt-4 pb-2'>
                <div className='flex-center relative xs:hidden'>
                    <Link href={`/${loggedInUser.username}`} className='absolute left-0' onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={loggedInUser.profile.profilePicture}
                            alt='User profile picture'
                            width={100} height={100}
                            className='w-[30px] h-[30px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <Link href='/' className=''>
                        <Image src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite} alt='Tweetly logo' width='30' height='30' className='mx-auto' />
                    </Link>
                </div>
                <h1 className='hidden xs:block text-20 font-bold'>Home</h1>
            </div>
        )
    }

    const pathName = path.slice(1);

    const handleBackClick = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className='h-header flex items-center gap-6 px-2'>
            <button onClick={handleBackClick}>
                <ArrowLeft size={22} />
            </button>
            {pathName.includes('status')
                ? (
                    <h1 className='text-20 font-bold'>Post</h1>
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
    )
}
