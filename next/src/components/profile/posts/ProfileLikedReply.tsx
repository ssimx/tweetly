'use client';
import { useEffect, useState } from 'react';
import { Reply } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BasicPostType } from '@/lib/types';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import BasicPostTemplate from '@/components/posts/templates/BasicPostTemplate';
import UserHoverCard from '@/components/misc/UserHoverCard';

export default function ProfileLikedReply({ post }: { post: BasicPostType & { replyTo: BasicPostType } }) {
    const { suggestions } = useFollowSuggestionContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // PARENT POST

    const [isParentFollowedByTheUser, setParentIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo.author.username)?.isFollowed
        ?? post.replyTo.author.followers.length === 1
    );

    const [isParentFollowingTheUser] = useState<boolean>(post.replyTo.author.following.length === 1);

    const [parentFollowingCount, setParentFollowingCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo.author.username)?._count.following
        ?? post.replyTo.author._count.following
    );

    const [parentFollowersCount, setParentFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.replyTo.author.username)?._count.followers
        ?? post.replyTo.author._count.followers
    );

    // ORIGINAL POST

    // if user is in suggestions, track it's isFollowed property instead
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?.isFollowed
        ?? post.author.followers.length === 1
    );

    // Is post author following the logged in user
    const [isFollowingTheUser, setIsFollowingTheUser] = useState<boolean>(post.author.following.length === 1);

    // Post author following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [followingCount, setFollowingCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.following
        ?? post.author._count.following
    );
    const [followersCount, setFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === post.author.username)?._count.followers
        ?? post.author._count.followers
    );

    useEffect(() => {
        const suggestedUsers = suggestions?.filter((suggestedUser) => suggestedUser.username === post.replyTo?.author.username || suggestedUser.username === post.author.username);
        if (suggestedUsers) {
            suggestedUsers.forEach((user, index) => {
                if (user.username === post.replyTo?.author.username) {
                    setParentIsFollowedByTheUser(suggestedUsers[index].isFollowed);
                    setParentFollowingCount(suggestedUsers[index]._count.following);
                    setParentFollowersCount(suggestedUsers[index]._count.followers);
                } else if (user.username === post.author.username) {
                    setIsFollowedByTheUser(suggestedUsers[index].isFollowed);
                    setFollowingCount(suggestedUsers[index]._count.following);
                    setFollowersCount(suggestedUsers[index]._count.followers);
                }
            });

        }
    }, [suggestions, post]);

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

            <div
                className='flex items-center gap-1 text-14 text-secondary-text'
                onClick={(e) => handleCardClick(e, post.replyTo!.author.username, post.replyTo!.id)} >

                <Reply size={16} className='text-secondary-text' />
                <div className='flex gap-x-1'>
                    <p className='flex items-center gap-1'>Reply to </p>
                    <UserHoverCard
                        user={post.replyTo.author}
                        _followingCount={parentFollowingCount}
                        _followersCount={parentFollowersCount}
                        _setFollowersCount={setParentFollowersCount}
                        isFollowedByTheUser={isParentFollowedByTheUser}
                        setIsFollowedByTheUser={setParentIsFollowedByTheUser}
                        isFollowingTheUser={isParentFollowingTheUser} />
                </div>
            </div>

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
