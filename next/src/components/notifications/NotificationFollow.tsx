'use client';
import Image from 'next/image';
import Link from 'next/link';
import UserHoverCard from '../misc/UserHoverCard';
import { useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserRoundPlus } from 'lucide-react';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { UserDataType } from 'tweetly-shared';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';

export default function NotificationFollow({ notifier, isRead }: { notifier: UserDataType, isRead: boolean }) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const router = useRouter();

    const cardRef = useRef<HTMLDivElement>(null);

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // NOTIFIER/FOLLOWER
    const userInitialState: UserStateType = {
        relationship: {
            isFollowingViewer: notifier.relationship.isFollowingViewer,
            hasBlockedViewer: notifier.relationship.hasBlockedViewer,
            isFollowedByViewer: notifier.relationship.isFollowedByViewer,
            isBlockedByViewer: notifier.relationship.isBlockedByViewer,
            notificationsEnabled: notifier.relationship.notificationsEnabled,
        },
        stats: {
            followersCount: notifier.stats.followersCount,
            followingCount: notifier.stats.followingCount,
            postsCount: notifier.stats.postsCount,
        }
    };
    const [userState, dispatch] = useReducer(userInfoReducer, userInitialState);

    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === notifier.username);
        if (suggestedUser) {
            dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
        }
    }, [userFollowSuggestions, dispatch, notifier.username]);

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
                    userState={userState}
                    dispatch={dispatch}
                     />
                <p>followed you</p>
            </div>
        </div>
    )
}
