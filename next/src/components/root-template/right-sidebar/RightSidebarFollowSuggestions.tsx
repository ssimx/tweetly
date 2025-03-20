'use client';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import DialogSuggestionCard from './DialogSuggestionCard';
import SuggestionCard from './SuggestionCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ClipLoader from 'react-spinners/ClipLoader';
import { usePathname } from 'next/navigation';

export default function RightSidebarFollowSuggestions() {
    const { suggestions } = useFollowSuggestionContext();
    const pathname = usePathname();
    
    if (pathname.startsWith('/messages/')) return <></>

    return (
        <div className='w-full h-fit rounded-[15px] border p-3 flex flex-col gap-2'>
            <h1 className='font-bold text-20'>Who to follow</h1>
            <div className='flex-grow'>
                {
                    suggestions === undefined
                        ? (
                            <div className='w-full flex justify-center my-3'>
                                <ClipLoader
                                    className='loading-spinner'
                                    loading={true}
                                    size={25}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        )
                        : suggestions.length !== 0
                            ? suggestions.slice(0, 4).map((user) => (
                                <SuggestionCard key={user.username} user={user} />
                            ))
                            : null
                }
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <button className='w-full text-primary text-start hover:font-semibold disabled:hidden' disabled={suggestions === undefined}>Show more</button>
                </DialogTrigger>
                {
                    suggestions !== undefined && suggestions.length !== 0 && (
                        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-hidden">
                            <DialogHeader className='mb-3'>
                                <DialogTitle className='text-20 font-bold'>Suggested for you</DialogTitle>
                            </DialogHeader>
                            <div className='flex-grow overflow-y-auto max-h-[calc(90vh-100px)]'>
                                {
                                    suggestions === undefined
                                        ? (
                                            <div className='w-full flex justify-center my-3'>
                                                <ClipLoader
                                                    className='loading-spinner'
                                                    loading={true}
                                                    size={25}
                                                    aria-label="Loading Spinner"
                                                    data-testid="loader"
                                                />
                                            </div>
                                        )
                                        : suggestions.map((user) => (
                                            <DialogSuggestionCard key={user.username} user={user} />
                                        ))
                                }
                            </div>
                        </DialogContent>
                    )
                }
            </Dialog>
        </div>
    )
}
