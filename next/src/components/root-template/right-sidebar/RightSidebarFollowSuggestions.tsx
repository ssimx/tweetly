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
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';

export default function RightSidebarFollowSuggestions() {
    const { suggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();

    return (
        <div className='w-full h-fit rounded-[15px] border p-3 flex flex-col gap-2'>
            <h1 className='font-bold text-20'>Who to follow</h1>
            <div className='flex-grow'>
                {
                    suggestions === undefined
                        ? 'loading'
                        : suggestions.slice(0, 4).length === 0
                            ? 'You are currently following everyone'
                            : suggestions.slice(0, 4).map((user, index) => {
                                return !blockedUsers.some((username) => username === user.username) && <SuggestionCard key={index} user={user} />;
                            })
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
                                        ? 'loading'
                                        : suggestions.map((user, index) => {
                                            return !blockedUsers.some((username) => username === user.username) && <DialogSuggestionCard key={index} user={user} />;
                                        })
                                }
                            </div>
                        </DialogContent>
                    )
                }
            </Dialog>
        </div>
    )
}
