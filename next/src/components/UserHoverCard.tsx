'use client';
import { useUserContext } from '@/context/UserContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { useRouter } from 'next/navigation';
import FollowBtn from './FollowBtn';

interface AuthorType {
    username: string,
    name: string,
    profilePicture: string,
    bio: string,
    following: number,
};

interface UserHoverCardType {
    author: AuthorType,
    followersCount: number,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    isFollowingTheUser: boolean,
};

export default function UserHoverCard({
    author,
    followersCount,
    setFollowersCount,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    isFollowingTheUser,
}: UserHoverCardType) {
    const { loggedInUser } = useUserContext();
    const userIsAuthor = author.username === loggedInUser.username;
    const router = useRouter();

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    return (
        <div onClick={() => router.push(`/${author.username}`)} role='link'>
            <HoverCard>
                <HoverCardTrigger asChild onClick={(e) => handleLinkClick(e)}>
                    <Link href={`/${author.username}`} className='text-primary-text w-fit whitespace-nowrap overflow-hidden font-bold hover:underline'>
                        {author.name}
                    </Link>
                </HoverCardTrigger>
                <HoverCardContent>
                    <div className='user-hover-card-info'>
                        <div className='user-hover-card-header'>
                            <Link href={`/${author.username}`} className='group w-fit' onClick={(e) => handleLinkClick(e)}>
                                <Image
                                    src={author.profilePicture}
                                    alt='User profile picture'
                                    width={60} height={60}
                                    className='w-[60px] h-[60px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                            </Link>
                            <div>
                                {!userIsAuthor && (
                                    <FollowBtn
                                        username={author.username}
                                        isFollowedByTheUser={isFollowedByTheUser}
                                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                                        setFollowersCount={setFollowersCount}
                                    />
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <Link href={`/${author.username}`} className='font-bold w-fit text-18 hover:underline' onClick={(e) => handleLinkClick(e)}>{author.name}</Link>
                            <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                                <p className='text-secondary-text'>@{author.username}</p>
                                {loggedInUser.username !== author.username && isFollowingTheUser && (
                                    <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className='break-all'>{author.bio}</p>
                        </div>
                        <div className='flex gap-4'>
                            <Link href={`/${author.username}/following`} className='hover:underline' onClick={(e) => handleLinkClick(e)}>
                                <p className='font-bold'>{`${author.following}`} <span className='text-secondary-text font-normal'>Following</span></p>
                            </Link>
                            <Link href={`/${author.username}/followers`} className='hover:underline' onClick={(e) => handleLinkClick(e)}>
                                <p className='font-bold'>{`${followersCount}`} <span className='text-secondary-text font-normal'>Followers</span></p>
                            </Link>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    )
}
