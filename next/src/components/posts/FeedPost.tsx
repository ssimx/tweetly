'use client';
import { BasicPostType, FollowSuggestionType } from '@/lib/types';
import PostBtns from './PostBtns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserHoverCard from '../UserHoverCard';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import PostText from './PostText';
import PostImages from './PostImages';
import PostMenu from './PostMenu';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import PostAuthorImage from './PostAuthorImage';
import PostDate from './PostDate';

export default function FeedPost({ post, searchSegments }: { post: BasicPostType, searchSegments?: string[] }) {
    const [postAuthor, setPostAuthor] = useState<FollowSuggestionType>({ ...post.author, isFollowing: post.author.followers.length === 1 });
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState<boolean>(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author['_count'].followers);
    const { suggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);

    const router = useRouter();

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const targetElement = e.target as HTMLElement;

        // skip any clicks that are not coming from the card element
        if (!targetElement.closest('main') || targetElement.closest('button') || targetElement.closest('img') || targetElement.closest('a')) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        // Otherwise, navigate to the post in new tab
        if (e.button === 1) {
            // Check if it's a middle mouse button click
            e.preventDefault(); // Prevent default middle-click behavior
            const newWindow = window.open(`/${postAuthor.username}/status/${post.id}`, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        } else if (e.button === 0) {
            // Check if it's a left mouse button click
            router.push(`/${postAuthor.username}/status/${post.id}`);
        }
    };

    const openPhoto = (photoIndex: number) => {
        router.push(`http://localhost:3000/${post.author.username}/status/${post.id}/photo/${photoIndex + 1}`, { scroll: false });
    };

    useEffect(() => {
        if (suggestions && suggestions.find((user) => user.username === post.author.username)) {
            const author = suggestions.find((user) => user.username === post.author.username) as FollowSuggestionType;
            setPostAuthor(author);
            setIsFollowedByTheUser(author.isFollowing);
        }
    }, [post, suggestions]);

    if (blockedUsers.some((user) => user === postAuthor.username)) {
        return (
            <div className="w-full px-4 py-2 flex">
                <p className="text-secondary-text">You&apos;ve blocked this user. <span>Unblock to see their posts.</span></p>
                <PostMenu
                    post={post}
                    isFollowedByTheUser={isFollowedByTheUser}
                    setIsFollowedByTheUser={setIsFollowedByTheUser}
                    setFollowersCount={setFollowersCount}
                />
            </div>
        )
    }

    return (
        <div onMouseDown={handleCardClick} className='feed-post' role="link" tabIndex={0} aria-label={`View post by ${postAuthor.username}`}>
            <div className='feed-post-left-side'>
                <PostAuthorImage author={post.author} />
            </div>

            <div className='feed-post-right-side'>
                <div className='flex gap-2 text-secondary-text'>
                    <UserHoverCard
                        author={{
                            username: postAuthor.username,
                            name: postAuthor.profile.name,
                            profilePicture: postAuthor.profile.profilePicture,
                            bio: postAuthor.profile.bio,
                            following: postAuthor['_count'].following,
                        }}
                        followersCount={followersCount}
                        setFollowersCount={setFollowersCount}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        isFollowingTheUser={isFollowingTheUser} />
                    <p>@{postAuthor.username}</p>
                    <p>·</p>
                    <PostDate createdAt={post.createdAt} />
                    <PostMenu
                        post={post}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        setFollowersCount={setFollowersCount}
                    />
                </div>

                <div className='feed-post-content post-content flex-col'>
                    <PostText content={post.content} searchSegments={searchSegments} />
                    <PostImages images={post.images} openPhoto={openPhoto} />
                </div>

                <div className='!border-t-0 post-btns'>
                    <PostBtns post={post} />
                </div>
            </div>
        </div>
    )
}
