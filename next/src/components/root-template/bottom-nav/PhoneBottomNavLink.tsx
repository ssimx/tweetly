'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

type LinkType = {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    route: string;
    label: string;
};

export default function PhoneBottomNavLink({ link, messages, notifications }: { link: LinkType, messages: boolean, notifications: boolean }) {
    const pathName = usePathname();

    const Icon = link.icon;

    if (link.label === 'Notifications') {
        return (
            <Link
                href={link.route} >
                <div className='relative flex items-center gap-4'>
                    {notifications === true && (
                        <div className='absolute right-0 top-0 translate-y-[-25%] translate-x-[50%] z-10 w-[12px] h-[12px] bg-primary rounded-full border border-[var(--primary-text-color)]'></div>
                    )}
                    <Icon size={24} className={pathName === link.route ? 'text-primary' : 'text-secondary-foreground'} />
                </div>
            </Link>
        )
    }

    if (link.label === 'Messages') {
        return (
            <Link
                href={link.route}>
                <div className='relative flex items-center gap-4'>
                    {messages === true && (
                        <div className='absolute right-0 top-0 translate-y-[-25%] translate-x-[50%] z-10 w-[12px] h-[12px] bg-primary rounded-full border border-[var(--primary-text-color)]'></div>
                    )}
                    <Icon size={24} className={pathName === link.route ? 'text-primary' : 'text-secondary-foreground'} />
                </div>
            </Link>
        )
    }

    return (
        <Link href={link.route}>
            <Icon size={24} className={pathName === link.route ? 'text-primary' : 'text-secondary-foreground'} />
        </Link>
    )
}
