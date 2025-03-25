'use client';
import { useUserContext } from '@/context/UserContextProvider';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import SettingsHeaderInfo from './SettingsHeaderInfo';
import Image from 'next/image';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountDeactivate() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(() => true);

        try {
            const response = await fetch('/api/users/deactivate', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json();
                setIsSubmitting(() => false);
                throw new Error(errorData.error);
            }

            router.push('/logout');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            <Link href={'/' + loggedInUser.username} className='flex gap-2 mb-[-5] px-3 py-2 hover:bg-post-hover'>
                <Image
                    src={loggedInUser.profile.profilePicture}
                    alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                <div className='flex flex-col'>
                    <p className='font-bold'>{loggedInUser.profile.name}</p>
                    <p>@{loggedInUser.username}</p>
                </div>
            </Link>
            <SettingsHeaderInfo header='This will deactivate your account' desc="You’re about to start the process of deactivating your Tweetly account. Your display name, @username, and public profile will no longer be viewable on tweetly.com" />
            <div className='feed-hr-line mb-2'></div>
            <SettingsHeaderInfo header='What else you should know' desc="You can restore your Tweetly account if it was accidentally or wrongfully deactivated for up to 30 days after deactivation." />
            <div className='flex flex-col gap-2 mx-4'>
                <p className='text-14 text-secondary-text'>
                    If you just want to change your @username, you don’t need to deactivate your account — edit it in your <Link href='/settings/account/information' className='text-primary hover:underline'>settings</Link>.
                </p>
                <p className='text-14 text-secondary-text'>
                    To use your current @username or email address with a different X account, <Link href='/settings/account/information' className='text-primary hover:underline'>change them</Link> before you deactivate this account.
                </p>
            </div>
            <div className='feed-hr-line my-2 mb-4'></div>
            <form suppressHydrationWarning onSubmit={(e) => onSubmit(e)} id='deactivate' className='w-full px-6 flex-center'>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        {isSubmitting
                            ? <Button disabled className='bg-red-600 font-bold w-full'>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deactivating
                            </Button>
                            : <Button className='bg-red-600 font-bold w-full hover:bg-red-700'>Deactivate</Button>
                        }
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction type='submit' form='deactivate' className='bg-red-600 font-bold w-full hover:bg-red-700'>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </form>
        </div>
    )
}
