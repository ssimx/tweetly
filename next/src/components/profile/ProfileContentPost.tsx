'use client';
import Link from 'next/link';
import Image from 'next/image';
import UserHoverCard from '../UserHoverCard';
import PostBtns from '../posts/PostBtns';
import { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContextProvider';
import PostText from '../posts/PostText';
import PostImages from '../posts/PostImages';
import { ProfilePostOrRepostType } from '@/lib/types';
import PostDate from '../posts/PostDate';

export default function ProfileContentPost({ post }: { post: ProfilePostOrRepostType }) {
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author['_count'].followers);

    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);

    const [postIsVisible, setPostIsVisible] = useState(true);
    const router = useRouter();
    const { loggedInUser } = useUserContext();
    const path = usePathname();

    const handleCardClick = () => {
        router.push(`/${post.author.username}/status/${post.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    const openPhoto = (photoIndex: number) => {
        router.push(`http://localhost:3000/${post.author.username}/status/${post.id}?photo=${photoIndex}`);
    };

    if (!postIsVisible) return <div className='mt-[-1px]'></div>;

    return (
        <div onClick={handleCardClick} className='profile-content-post'>
            {post.type === 'REPOST' && (
                <div className='flex items-center gap-1 text-14 font-bold text-secondary-text'>
                    <Repeat2 size={16} className='text-secondary-text' />
                    {path === `/${loggedInUser.username}`
                        ? <p>You reposted</p>
                        : <p>Reposted</p>
                    }
                </div>
            )}

            <div className='profile-content-post-content'>
                <div className='feed-post-left-side'>
                    <Link href={`/${post.author.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                        <Image
                            src={post.author.profile.profilePicture}
                            alt='Post author profile pic'
                            width={40} height={40}
                            className='w-[40px] h-[40px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                </div>
                <div className='feed-post-right-side'>
                    <div className='flex gap-2 text-secondary-text'>
                        <UserHoverCard
                            author={{
                                username: post.author.username,
                                name: post.author.profile.name,
                                profilePicture: post.author.profile.profilePicture,
                                bio: post.author.profile.bio,
                                following: post.author['_count'].following,
                            }}
                            followersCount={followersCount}
                            setFollowersCount={setFollowersCount}
                            isFollowedByTheUser={isFollowedByTheUser}
                            setIsFollowedByTheUser={setIsFollowedByTheUser}
                            isFollowingTheUser={isFollowingTheUser} />
                        <p>@{post.author.username}</p>
                        <p>·</p>
                        <PostDate createdAt={post.createdAt} />
                    </div>
                    <div className='post-content flex-col'>
                        <PostText content={post.content} />
                        <PostImages images={post.images} openPhoto={openPhoto} />
                    </div>
                    <div className='!border-t-0 post-btns'>
                        <PostBtns post={post} setPostIsVisible={setPostIsVisible} />
                    </div>
                </div>
            </div>
        </div>
    )
}
