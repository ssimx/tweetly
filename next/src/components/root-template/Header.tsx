'use client';
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';

export default function TemplateHeader() {
    const path = usePathname();
    const router = useRouter();
    
    if (path === '/') {
        return (
            <div className='h-fit px-2 pt-4 pb-2'>
                <h1 className='text-20 font-bold'>Home</h1>
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

    console.log(path, path.indexOf('/'));
    

    return (
        <div className='h-fit flex items-center gap-6 px-2 pt-4 pb-2'>
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
                    : (
                        <h1 className='text-20 font-bold'>{`${pathName.charAt(0).toUpperCase() + pathName.slice(1)}`}</h1>
                    )

            }
        </div>
    )
}
