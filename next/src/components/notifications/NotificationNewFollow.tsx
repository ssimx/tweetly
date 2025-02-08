'use client';
import Image from 'next/image';
import Link from 'next/link';
import UserHoverCard from '../UserHoverCard';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRoundPlus } from 'lucide-react';

interface NotificationType {
    username: string,
    profile: {
        name: string,
        profilePicture: string,
        bio: string
    },
    followers: {
        followerId: number,
    }[] | [],
    following: {
        followeeId: number,
    }[] | [],
    _count: {
        followers: number,
        following: number,
    }
}

export default function NotificationNewFollow({ isRead, notifier }: { isRead: boolean, notifier: NotificationType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(notifier['_count'].followers === 1);
    const [followersCount, setFollowersCount] = useState(notifier.followers.length);

    // state to show whether the profile follows logged in user
    const [isFollowingTheUser, setIsFollowingTheUser] = useState(notifier.following.length === 1);
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);

    const handleCardClick = () => {
        router.push(`/${notifier.username}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    const changeCardColor = () => {
        cardRef.current !== null && cardRef.current.classList.remove('bg-secondary-foreground');
    };

    return (
        <div onClick={handleCardClick}
            className={`px-4 py-2 hover:cursor-pointer hover:bg-post-hover ${isRead === false ? 'bg-secondary-foreground' : ''}`}
            ref={cardRef} onMouseLeave={changeCardColor}>
            <div className='flex gap-2 items-center'>
                <UserRoundPlus size={20} className='text-primary' />
                <Link href={`/${notifier.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                    <Image
                        src={notifier.profile.profilePicture}
                        alt='Post author profile pic'
                        width={36} height={36}
                        className='w-[36px] h-[36px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                </Link>
                <UserHoverCard
                    author={{
                        username: notifier.username,
                        name: notifier.profile.name,
                        profilePicture: notifier.profile.profilePicture,
                        bio: notifier.profile.bio,
                        following: notifier['_count'].following,
                    }}
                    followersCount={followersCount}
                    setFollowersCount={setFollowersCount}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser}
                    isFollowingTheUser={isFollowingTheUser} />
                <p>followed you</p>
            </div>
        </div>
    )
}
