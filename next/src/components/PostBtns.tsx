'use client';
import { useUserContext } from "@/context/UserContextProvider";
import { PostInfoType } from "@/lib/types";
import { Bookmark, Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import Link from "next/link";


export default function PostBtns({ post }: { post: PostInfoType }) {
    const { user } = useUserContext();

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
                <Link href={`/${post.author.username}/status/${post.id}`} className='comment-btn group'>
                    <div className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-blue-1/10'>
                        <MessageCircle size={20}
                            className='text-dark-400 group-hover:text-blue-1/70' />
                    </div>
                    <p>{post.replies.length}</p>
                </Link>
                <button
                    className={`repost-btn group ${post.reposts.some((repost) => repost.userId === user.id) ? 'reposted' : ''}`}
                    data-type='repost'
                    data-status={`${post.reposts.some((repost) => repost.userId === user.id)}`}
                    onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                    <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-green-500/10'>
                        <Repeat2 size={24} className='text-dark-400 group-hover:text-green-500/70' />
                    </span>
                    <p>{post.reposts.length}</p>
                </button>
                <button
                    className={`like-btn group ${post.likes.some((like) => like.userId === user.id) ? 'liked' : ''}`}
                    data-type='like'
                    data-status={`${post.likes.some((like) => like.userId === user.id)}`}
                    onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                    <span className='h-[35px] w-[35px] rounded-full flex-center group-hover:bg-pink-500/10'>
                        <Heart size={20} className='text-dark-400 group-hover:text-pink-500' />
                    </span>
                    <p>{post.likes.length}</p>
                </button>
            </div>
            <button
                className={`bookmark-btn group ${post.bookmarks.some((bookmark) => bookmark.userId === user.id) ? 'bookmarked' : ''}`}
                data-type='bookmark'
                data-status={`${post.bookmarks.some((bookmark) => bookmark.userId === user.id)}`}
                onClick={(e) => handlePostBtnsInteraction(e, post.id)}>
                <Bookmark size={20} className='text-dark-400 text-blue-1/70' />
            </button>
            <button className='share-btn group'>
                <Share size={20} className='text-dark-400 group-hover:text-blue-1/70' />
            </button>
        </div>
    )
}
