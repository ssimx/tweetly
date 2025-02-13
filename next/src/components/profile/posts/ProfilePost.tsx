'use client';
import { useEffect, useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ProfilePostOrRepostType } from '@/lib/types';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useUserContext } from '@/context/UserContextProvider';
import BasicPostTemplate from '@/components/posts/templates/BasicPostTemplate';

export default function ProfilePost({ post }: { post: ProfilePostOrRepostType }) {
    const { suggestions } = useFollowSuggestionContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();
    const path = usePathname();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // if user is in suggestions, track it's isFollowed property instead
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?.isFollowed ?? post.author.followers.length === 1);
    // Is post author following the logged in user
    const [isFollowingTheUser, setIsFollowingTheUser] = useState<boolean>(post.author.following.length === 1);

    // Post author following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [followingCount, setFollowingCount] = useState(suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.following ?? post.author._count.following);
    const [followersCount, setFollowersCount] = useState(suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.followers ?? post.author._count.followers);

    useEffect(() => {
        const suggestedUser = suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username);
        if (suggestedUser) {
            setIsFollowedByTheUser(suggestedUser.isFollowed);
            setFollowingCount(suggestedUser._count.following);
            setFollowersCount(suggestedUser._count.followers);
        }
    }, [suggestions, post.author.username]);

    // - FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, authorUsername: string, postId: number) => {
        const targetElement = e.target as HTMLElement;

        // skip any clicks that are not coming from the card element
        if (targetElement.closest('button') || targetElement.closest('img') || targetElement.closest('a')) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        // Otherwise, navigate to the post in new tab
        if (e.button === 1) {
            // Check if it's a middle mouse button click
            e.preventDefault(); // Prevent default middle-click behavior
            const newWindow = window.open(`/${authorUsername}/status/${postId}`, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        } else if (e.button === 0) {
            // Check if it's a left mouse button click
            router.push(`/${authorUsername}/status/${postId}`);
        }
    };

    const openPhoto = (photoIndex: number, authorUsername: string, postId: number) => {
        router.push(`http://localhost:3000/${authorUsername}/status/${postId}/photo/${photoIndex + 1}`, { scroll: false });
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    return (
        <div
            className='w-full flex flex-col gap-2 px-4 pt-3 pb-1 hover:bg-post-hover cursor-pointer'
            role="link"
            tabIndex={0}
            aria-label={`View post by ${post.author.username}`}
            onClick={(e) => handleCardClick(e, post.author.username, post.id)} >

            {post.type === 'REPOST' && (
                <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                    <Repeat2 size={16} className='text-secondary-text' />
                    {path === `/${loggedInUser.username}`
                        ? <p>You reposted</p>
                        : <p>Reposted</p>
                    }
                </div>
            )}

            <BasicPostTemplate
                post={post}
                isFollowedByTheUser={isFollowedByTheUser}
                setIsFollowedByTheUser={setIsFollowedByTheUser}
                isFollowingTheUser={isFollowingTheUser}
                setIsFollowingTheUser={setIsFollowingTheUser}
                followingCount={followingCount}
                setFollowingCount={setFollowingCount}
                followersCount={followersCount}
                setFollowersCount={setFollowersCount}
                openPhoto={openPhoto}
            />

        </div>
    )
}
