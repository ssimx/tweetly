'use client';
import DialogTrendingCard from '@/components/root-template/right-sidebar/DialogTrendingCard';
import TrendingCard from '@/components/root-template/right-sidebar/TrendingCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useTrendingContext } from '@/context/TrendingContextProvider';

export default function ExploreTrendingHashtags() {
    const { hashtags } = useTrendingContext();

    return (
        <div className='px-4 pb-4'>
            <h1 className='text-24 font-bold mb-2'>Trending</h1>
            <div className='flex flex-col flex-grow'>
                {
                    hashtags === undefined
                        ? 'loading'
                        : hashtags.slice(0, 8).length === 0
                            ? 'There is currently no trending hashtags'
                            : hashtags.slice(0, 8).map((hashtag) => (
                                <TrendingCard key={hashtag.name} hashtag={hashtag} />
                            ))
                }
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <button className='w-full text-primary text-start hover:font-semibold disabled:hidden' disabled={hashtags === undefined}>Show more</button>
                </DialogTrigger>
                {
                    hashtags !== undefined && hashtags.length !== 0 && (
                        <DialogContent className="max-w-[500px] max-h-[90vh] overflow-hidden">
                            <DialogHeader className='mb-3'>
                                <DialogTitle className='text-20 font-bold'>Currently trending</DialogTitle>
                            </DialogHeader>
                            <div className='flex-grow overflow-y-auto max-h-[calc(90vh-100px)]'>
                                {
                                    hashtags === undefined
                                        ? 'loading'
                                        : hashtags.map((hashtag) => (
                                            <DialogTrendingCard key={hashtag.name} hashtag={hashtag} />
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
