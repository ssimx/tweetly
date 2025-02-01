'use client';
import { FollowSuggestionType, PostType } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from '../posts/PostBtns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserHoverCard from '../UserHoverCard';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import PostText from '../posts/PostText';
import PostImages from '../posts/PostImages';
import PostMenu from '../posts/PostMenu';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import PostAuthorImage from './PostAuthorImage';

export default function Post({ post, searchSegments }: { post: PostType, searchSegments?: string[] }) {
    const [postAuthor, setPostAuthor] = useState<FollowSuggestionType>({ ...post.author, isFollowing: post.author.followers.length === 1 });
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState<boolean>(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author['_count'].followers);
    const { suggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);

    const router = useRouter();

    useEffect(() => {
        if (suggestions && suggestions.find((user) => user.username === post.author.username)) {
            const author = suggestions.find((user) => user.username === post.author.username) as FollowSuggestionType;
            setPostAuthor(author);
            setIsFollowedByTheUser(author.isFollowing);
        }
    }, [post, suggestions]);

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const targetElement = e.target as HTMLElement;

        // skip any clicks that are not coming from the card element
        if (!targetElement.closest('main') || targetElement.closest('button') || targetElement.closest('img') || targetElement.closest('a')) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        console.log(targetElement)

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

    // When post is visited/opened, it has different structure including their replies

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
                    <p className='whitespace-nowrap'>{formatPostDate(post.createdAt)}</p>
                    <PostMenu
                        post={post}
                        isFollowedByTheUser={isFollowedByTheUser}
                        setIsFollowedByTheUser={setIsFollowedByTheUser}
                        setFollowersCount={setFollowersCount}
                    />
                </div>

                <div className='feed-post-content post-content flex-col'>
                    <PostText content={post.content} searchSegments={searchSegments} />
                    <PostImages images={post.images} />
                </div>

                <div className='!border-t-0 post-btns'>
                    <PostBtns
                        postId={post.id}
                        author={postAuthor.username}
                        replies={post['_count'].replies}
                        reposts={post['_count'].reposts}
                        likes={post['_count'].likes}
                        reposted={!!post.reposts.length}
                        liked={!!post.likes.length}
                        bookmarked={!!post.bookmarks.length} />
                </div>
            </div>
        </div>
    )
}
