'use client';
import { useUserContext } from "@/context/UserContextProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

interface LinkType {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    route: string;
    label: string;
}

export default function LeftSidebarLink({ link, messages, notifications }: { link: LinkType, messages: boolean, notifications: boolean }) {
    const pathname = usePathname();
    const { loggedInUser } = useUserContext();

    const Icon = link.icon;

    if (link.label === 'Notifications') {
        return (
            <Link 
                href={link.route} 
                className='flex gap-4 items-center top-0 right-0'>
                    <div className='relative flex gap-4'>
                        { notifications === true && (
                            <div className='absolute right-0 top-0 translate-y-[-25%] translate-x-[25%] z-10 w-[15px] h-[15px] bg-primary rounded-full border-2 border-[#ffffff]'></div>
                        )}
                        <Icon className='z-1 icon'
                            color={pathname === link.route ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                        />
                        <p className={`${pathname === link.route && 'font-bold'} text-20`} >{link.label}</p>
                    </div>
            </Link>
        )
    }

    if (link.label === 'Messages') {
        return (
            <Link
                href={link.route}
                className='flex gap-4 items-center top-0 right-0'>
                <div className='relative flex gap-4'>
                    { messages === true && (
                        <div className='absolute right-0 top-0 translate-y-[-25%] translate-x-[25%] z-10 w-[15px] h-[15px] bg-primary rounded-full border-2 border-[#ffffff]'></div>
                    )}
                    <Icon className='z-1 icon'
                        color={pathname === link.route || /^\/messages\/.+/.test(pathname) ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                    />
                    <p className={`${pathname === link.route && 'font-bold'} text-20`} >{link.label}</p>
                </div>
            </Link>
        )
    }

    if (link.label === 'Profile') {
        return (
            <Link href={link.route === '/profile' ? `/${loggedInUser.username}` : link.route} className='flex gap-4 items-center'>
                <Icon className='icon'
                    color={pathname === '/' + loggedInUser.username ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                />
                <p className={`${pathname === '/' + loggedInUser.username && 'font-bold'} text-20`} >{link.label}</p>
            </Link>
        )
    }

    return (
        <Link href={link.route === '/profile' ? `/${loggedInUser.username}` : link.route} className='flex gap-4 items-center'>
            <Icon className='icon'
                color={pathname === link.route ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
            />
            <p className={`${pathname === link.route && 'font-bold'} text-20`} >{link.label}</p>
        </Link>
    )
}
