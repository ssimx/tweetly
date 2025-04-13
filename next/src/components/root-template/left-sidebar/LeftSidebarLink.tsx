'use client';
import { useUserContext } from "@/context/UserContextProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

type LinkType = {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    route: string;
    label: string;
};

export default function LeftSidebarLink({ link, messages, notifications }: { link: LinkType, messages: boolean, notifications: boolean }) {
    const pathName = usePathname();
    const { loggedInUser } = useUserContext();

    const Icon = link.icon;

    if (link.label === 'Notifications') {
        return (
            <Link
                href={link.route}
                className='w-fit flex gap-4 items-center hover:bg-card-hover px-3 py-4 rounded-[30px] top-0 right-0'>
                <div className='relative flex items-center gap-4'>
                    <div className='relative'>
                        <Icon className={`z-1 icon ${pathName === link.route ? 'text-primary' : 'text-primary-text'}`} />
                        {notifications === true && (
                            <div
                                className={`absolute right-0 top-0 translate-y-[-20%] translate-x-[30%] z-10 size-[14px] bg-primary rounded-full border-2 border-primary-foreground`}
                            ></div>
                        )}
                    </div>
                    <p className={`${pathName === link.route && 'font-bold'} text-20`} >{link.label}</p>
                </div>
            </Link>
        )
    }

    if (link.label === 'Messages') {
        return (
            <Link
                href={link.route}
                className='w-fit flex gap-4 items-center hover:bg-card-hover px-3 py-4 rounded-[30px] top-0 right-0'>
                <div className='flex items-center gap-4'>
                    <div className='relative'>
                        <Icon className={`z-1 icon ${pathName === link.route || /^\/conversation\/.+/.test(pathName) ? 'text-primary' : 'text-primary-text'}`} />
                        {messages === true && (
                            <div
                                className={`absolute right-0 top-0 translate-y-[-20%] translate-x-[30%] z-10 size-[14px] bg-primary rounded-full border-2 border-primary-foreground`}
                            ></div>
                        )}
                    </div>
                    <p className={`${(pathName === link.route || /^\/conversation\/.+/.test(pathName)) && 'font-bold'} text-20`} >{link.label}</p>
                </div>
            </Link>
        )
    }

    if (link.label === 'Settings') {
        return (
            <Link href={link.route} className='w-fit flex gap-4 items-center hover:bg-card-hover px-3 py-4 rounded-[30px]'>
                <Icon className={`icon ${pathName === link.route || /^\/settings\/.+/.test(pathName) ? 'text-primary' : 'text-primary-text'}`} />
                <p className={`${(pathName === link.route || /^\/settings\/.+/.test(pathName)) && 'font-bold'} text-20`} >{link.label}</p>
            </Link>
        )
    }

    if (link.label === 'Profile') {
        return (
            <Link href={link.route === '/profile' ? `/${loggedInUser.username}` : link.route} className='w-fit flex gap-4 items-center hover:bg-card-hover px-3 py-4 rounded-[30px]'>
                <Icon className={`icon ${pathName === '/' + loggedInUser.username ? 'text-primary' : 'text-primary-text'}`} />
                <p className={`${pathName === '/' + loggedInUser.username && 'font-bold'} text-20`} >{link.label}</p>
            </Link>
        )
    }

    return (
        <Link href={link.route} className='w-fit flex gap-4 items-center hover:bg-card-hover px-3 py-4 rounded-[30px]'>
            <Icon className={`icon ${pathName === link.route ? 'text-primary' : 'text-primary-text'}`} />
            <p className={`${pathName === link.route && 'font-bold'} text-20`} >{link.label}</p>
        </Link>
    )
}
