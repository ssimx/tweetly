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
import ClipLoader from 'react-spinners/ClipLoader';

export default function Trending() {
    const { hashtags } = useTrendingContext();

    return (
        <div className='w-full h-fit rounded-[15px] border p-3 flex flex-col gap-2'>
            <h1 className='font-bold text-20'>What&apos;s happening</h1>
            <div className='flex flex-col flex-grow'>
                {
                    hashtags === undefined
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
                        : hashtags.slice(0, 8).length === 0
                            ? 'There is currently no trending hashtags'
                            : hashtags.slice(0, 8).map((hashtag) => (
                                <TrendingCard key={hashtag.name} hashtag={hashtag} />
                            ))
                }
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <button className='w-full text-primary text-start hover:font-semibold disabled:hidden' disabled={hashtags === undefined || hashtags.length < 8}>Show more</button>
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
