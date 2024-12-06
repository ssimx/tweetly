import { decryptSession, getToken } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import TrendingCard from './TrendingCard';
import DialogTrendingCard from './DialogTrendingCard';

export interface TrendingHashtagType {
    name: string;
    _count: {
        posts: number;
    };
};

export default async function Trending() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const trendingHashtagsResponse = await fetch('http://localhost:3000/api/posts/trending', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });

    const trendingHashtags = await trendingHashtagsResponse.json().then(res => res.hashtags) as TrendingHashtagType[];

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
