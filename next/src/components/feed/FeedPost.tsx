'use client';
import { PostType } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from '../posts/PostBtns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserHoverCard from '../UserHoverCard';
import { UserSuggestion, useSuggestionContext } from '@/context/SuggestionContextProvider';
import PostContent from '../PostContent';

export default function FeedPost({ post }: { post: PostType }) {
    const [postAuthor, setPostAuthor] = useState<UserSuggestion>({...post.author, isFollowing: post.author.followers.length === 1});
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState<boolean>(post.author.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(post.author['_count'].followers);

    // state to show whether the profile follows logged in user
    const [isFollowingTheUser,] = useState(post.author.following.length === 1);

    const router = useRouter();
    const { suggestions } = useSuggestionContext();

    useEffect(() => {
        console.log('test');
        
        if (suggestions && suggestions.find((user) => user.username === post.author.username)) {
            const author = suggestions.find((user) => user.username === post.author.username) as UserSuggestion;
            setPostAuthor(author);
            setIsFollowedByTheUser(author.isFollowing);
        }
    }, [post, suggestions]);

    const handleCardClick = () => {
        router.push(`/${postAuthor.username}/status/${post.id}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
    };

    return (
        <div onClick={handleCardClick} className='feed-post'>
            <div className='feed-post-left-side'>
                <Link href={`/${postAuthor.username}`} className='flex group' onClick={(e) => handleLinkClick(e)}>
                    <Image
                        src={postAuthor.profile.profilePicture}
                        alt='Post author profile pic' 
                        width={40} height={40} 
                        className='w-[40px] h-[40px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                </Link>
            </div>

            <div className='feed-post-right-side'>
                <div className='flex gap-2 text-gray-500'>
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
                </div>

                <div className='feed-post-content post-content'>
                    <PostContent content={post.content} />
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
