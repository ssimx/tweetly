'use client';
import Image from 'next/image';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRoundPlus } from 'lucide-react';
import { UserInfoType } from '@/lib/types';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';

export default function NotificationFollow({ isRead, notifier }: { isRead: boolean, notifier: UserInfoType }) {
    const { suggestions } = useFollowSuggestionContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // USER WHO FOLLOWED

    // If notifier is in suggestions, track it's isFollowed property instead
    const [isNotifierFollowedByTheUser, setNotifierIsFollowedByTheUser] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === notifier.username)?.isFollowed
        ?? notifier.followers.length === 1
        ?? false
    );

    // Is notifier following the logged in user, notifier can't be blocked in hoverCard so no need for setter function
    const [isNotifierFollowingTheUser,] = useState<boolean>(notifier.following.length === 1);

    // Notifier following & followers count to update hover card information when they're (un)followed/blocked by logged in user
    const [notifierFollowingCount,] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === notifier.username)?._count.following
        ?? notifier._count.following
        ?? 0
    );
    const [notifierFollowersCount, setNotifierFollowersCount] = useState(
        suggestions?.find((suggestedUser) => suggestedUser.username === notifier.username)?._count.followers
        ?? notifier._count.followers
        ?? 0
    );

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const suggestedUser = suggestions?.find((suggestedUser) => suggestedUser.username === notifier.username);
        if (suggestedUser) {
            setNotifierIsFollowedByTheUser(suggestedUser.isFollowed);
            setNotifierFollowersCount(suggestedUser._count.followers);
        }
    }, [suggestions, notifier]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button === 1) {
            // Check if it's a middle mouse button click
            e.preventDefault(); // Prevent default middle-click behavior
            const newWindow = window.open(`/${notifier.username}`, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        } else if (e.button === 0) {
            // Check if it's a left mouse button click
            router.push(`/${notifier.username}`);
        }
    };

    const changeCardColor = () => {
        cardRef.current !== null && cardRef.current.classList.remove('bg-secondary-foreground');
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    return (
        <div onClick={handleCardClick}
            className={`px-4 py-2 hover:cursor-pointer hover:bg-post-hover ${isRead === false ? 'bg-secondary-foreground' : ''}`}
            ref={cardRef} onMouseLeave={changeCardColor}>
            <div className='flex gap-2 items-center'>
                <UserRoundPlus size={20} className='text-primary' />
                <Link href={`/${notifier.username}`} className='flex group' onClick={(e) => e.stopPropagation()}>
                    <Image
                        src={notifier.profile.profilePicture}
                        alt='Post author profile pic'
                        width={36} height={36}
                        className='w-[36px] h-[36px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                </Link>
                <UserHoverCard
                    user={notifier}
                    _followingCount={notifierFollowingCount}
                    _followersCount={notifierFollowersCount}
                    _setFollowersCount={setNotifierFollowersCount}
                    isFollowedByTheUser={isNotifierFollowedByTheUser}
                    setIsFollowedByTheUser={setNotifierIsFollowedByTheUser}
                    isFollowingTheUser={isNotifierFollowingTheUser} />
                <p>followed you</p>
            </div>
        </div>
    )
}
