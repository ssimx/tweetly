'use client';
import { useEffect, useReducer } from 'react';
import Image from 'next/image';
import FollowButton from '../misc/FollowButton';
import { useUserContext } from '@/context/UserContextProvider';
import { useRouter } from 'next/navigation';
import UserHoverCard from '../misc/UserHoverCard';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { UserDataType } from 'tweetly-shared';
import ProfileMenuButton from './ProfileMenuButton';

export default function ProfileFollowersFollowingCard({ user }: { user: UserDataType }) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const userInitialState: UserStateType = {
        relationship: {
            isFollowingViewer: user.relationship.isFollowingViewer,
            hasBlockedViewer: user.relationship.hasBlockedViewer,
            isFollowedByViewer: user.relationship.isFollowedByViewer,
            isBlockedByViewer: user.relationship.isBlockedByViewer,
            notificationsEnabled: user.relationship.notificationsEnabled,
        },
        stats: {
            followersCount: user.stats.followersCount,
            followingCount: user.stats.followingCount,
            postsCount: user.stats.postsCount,
        }
    };
    const [userState, dispatch] = useReducer(userInfoReducer, userInitialState);

    const { 
        isFollowingViewer
    } = userState.relationship;

    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === user.username);
        if (suggestedUser) {
            dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' })
        }
    }, [user.username, userFollowSuggestions, dispatch]);

    const handleCardClick = () => {
        router.push(`/${user.username}`);
    };

    return (
        <div onClick={handleCardClick} className='profile-follower-followee-card'>
            <div>
                <Image
                    src={user.profile.profilePicture || 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png'}
                    height={40} width={40}
                    alt='Follower profile pic'
                    className='rounded-full min-w-[40px]' />
            </div>

            <div className='flex flex-col leading-5'>
                <div className='flex gap-x-2 flex-wrap items-center text-secondary-text'>
                    <UserHoverCard
                        user={user}
                        userState={userState}
                        dispatch={dispatch}
                    />

                    <div className='flex-center gap-2'>
                        <p className='text-16'>@{user.username}</p>
                        {loggedInUser.username !== user.username && isFollowingViewer && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>

                <div className='profile-card-bio-overflow' >
                    <p className='bio-content'>{user.profile.bio}</p>
                </div>
            </div>

            {loggedInUser.username !== user.username && (
                <>
                    <div className='ml-auto [&_button]:py-1'>
                        <FollowButton
                            user={user.username}
                            userState={userState}
                            dispatch={dispatch}
                        />
                    </div>
                    <div className='[&_button]:border-none [&_svg]:w-[18px] [&_svg]:h-[18px]'>
                        <ProfileMenuButton
                            user={user.username}
                            userState={userState}
                            dispatch={dispatch}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
