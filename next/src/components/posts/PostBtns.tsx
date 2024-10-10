'use client';
import { Bookmark, Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import Link from "next/link";

interface PostBtnsType {
    postId: number,
    author: string,
    replies: number,
    reposts: number,
    likes: number,
    reposted: boolean,
    liked: boolean,
    bookmarked: boolean,
};

export default function PostBtns({
    postId, author,
    replies, reposts, likes,
    reposted, liked, bookmarked
}: PostBtnsType) {

    const handlePostBtnsInteraction = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, postId: number) => {
        e.preventDefault();
        e.stopPropagation();

        const btn = e.currentTarget;
        const type = btn.dataset.type as string;
        const styleType = type === 'like' ? 'lik' : type;
        const status = btn.dataset.status;

        btn.disabled = true;
        // optimistically change the styling
        btn.classList.toggle(`${styleType}ed`);
        const counter = btn.childNodes.item(1) ? btn.childNodes.item(1) : undefined;
        if (status === 'true') {
            try {
                if (counter) {
                    if (counter.textContent === '0') {
                        throw new Error(`Failed to remove the ${type} on the post`);
                    } else {
                        counter.textContent = String(Number(counter.textContent) - 1);
                    }
                }

                const response = await fetch(`/api/posts/remove${type.charAt(0).toUpperCase() + type.slice(1)}/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to remove the ${type} on the post`);
                }

                btn.dataset.status = 'false';
            } catch (error) {
                console.log(error);
                // revert the styling
                btn.classList.toggle(`${styleType}ed`);
                counter ? counter.textContent = String(Number(counter.textContent) + 1) : null;
            }
        } else {
            counter ? counter.textContent = String(Number(counter.textContent) + 1) : null;

            try {
                const response = await fetch(`/api/posts/${type}/${postId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to ${type} the post`);
                }

                btn.dataset.status = 'true';
            } catch (error) {
                console.log(error);
                // revert the styling
                btn.classList.toggle(`${styleType}ed`);
                counter ? counter.textContent = String(Number(counter.textContent) - 1) : null;
            }
        }
        btn.disabled = false;
    };

    return (
        <div className="flex gap-2 justify-center items-end">
            <div className='w-[60%] sm:w-[50%] flex gap-1 justify-between'>
                <Link href={`/${author}/status/${postId}`} className='comment-btn group'>
                    <div className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-blue-1/10'>
                        <MessageCircle size={20}
                            className='text-dark-400 group-hover:text-blue-1/70' />
                    </div>
                    <p>{replies}</p>
                </Link>
                <button
                    className={`repost-btn group ${reposted ? 'reposted' : ''}`}
                    data-type='repost'
                    data-status={`${reposted === 1}`}
                    onClick={(e) => handlePostBtnsInteraction(e, postId)}>
                    <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-green-500/10'>
                        <Repeat2 size={24} className='text-dark-400 group-hover:text-green-500/70' />
                    </span>
                    <p>{reposts}</p>
                </button>
                <button
                    className={`like-btn group ${liked ? 'liked' : ''}`}
                    data-type='like'
                    data-status={`${liked}`}
                    onClick={(e) => handlePostBtnsInteraction(e, postId)}>
                    <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                        <Heart size={20} className='text-dark-400 group-hover:text-pink-500' />
                    </span>
                    <p>{likes}</p>
                </button>
            </div>
            <button
                className={`bookmark-btn group ${bookmarked ? 'bookmarked' : ''}`}
                data-type='bookmark'
                data-status={`${bookmarked}`}
                onClick={(e) => handlePostBtnsInteraction(e, postId)}>
                <Bookmark size={20} className='text-dark-400 text-primary' />
            </button>
            <button className='share-btn group'>
                <Share size={20} className='text-dark-400 group-hover:text-blue-1/70' />
            </button>
        </div>
    )
}
