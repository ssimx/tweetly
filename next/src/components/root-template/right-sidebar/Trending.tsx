'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import TrendingCard from './TrendingCard';
import DialogTrendingCard from './DialogTrendingCard';
import { useTrendingContext } from "@/context/TrendingContextProvider";


export default function Trending() {
    const { trendingHashtags } = useTrendingContext();

    return (
        <div className='w-full h-fit rounded-[15px] border p-3 flex flex-col gap-2'>
            <h1 className='font-bold text-20'>What&apos;s happening</h1>
            <div className='flex flex-col flex-grow'>
                {
                    trendingHashtags === undefined
                        ? 'loading'
                        : trendingHashtags.slice(0, 8).length === 0
                            ? 'There is currently no trending hashtags'
                            : trendingHashtags.slice(0, 8).map((hashtag, index) => (
                                <TrendingCard key={index} hashtag={hashtag} />
                            ))
                }
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <button className='w-full text-primary text-start hover:font-semibold disabled:hidden' disabled={trendingHashtags === undefined}>Show more</button>
                </DialogTrigger>
                {
                    trendingHashtags !== undefined && trendingHashtags.length !== 0 && (
                        <DialogContent className="max-w-[500px] max-h-[90vh] overflow-hidden">
                            <DialogHeader className='mb-3'>
                                <DialogTitle className='text-20 font-bold'>Currently trending</DialogTitle>
                            </DialogHeader>
                            <div className='flex-grow overflow-y-auto max-h-[calc(90vh-100px)]'>
                                {
                                    trendingHashtags === undefined
                                        ? 'loading'
                                        : trendingHashtags.map((hashtag, index) => (
                                            <DialogTrendingCard key={index} hashtag={hashtag} />
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
