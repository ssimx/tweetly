'use client';
import { useEffect, useReducer } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/misc/UserHoverCard';
import FollowButton from '@/components/misc/FollowButton';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { UserDataType } from 'tweetly-shared';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';
import { useFollowSuggestionContext } from '@/context/FollowSuggestionContextProvider';
import { useUserContext } from '@/context/UserContextProvider';

export default function UserCard({ user }: { user: UserDataType }) {
    const { suggestions: userFollowSuggestions } = useFollowSuggestionContext();
    const { blockedUsers } = useBlockedUsersContext();
    const { loggedInUser } = useUserContext();
    const router = useRouter();

    // - STATES -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const initialState: UserStateType = {
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
    const [userState, dispatch] = useReducer(userInfoReducer, initialState);
    const { isFollowingViewer } = user.relationship;


    useEffect(() => {
        const suggestedUser = userFollowSuggestions?.find((suggestedUser) => suggestedUser.username === user.username);
        if (suggestedUser) {
            dispatch({ type: suggestedUser.relationship.isFollowedByViewer ? 'FOLLOW' : 'UNFOLLOW' });
        }
    }, [userFollowSuggestions, dispatch, user.username]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleCardClick = () => {
        router.push(`/${user.username}`);
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    if (blockedUsers.some((username) => username === user.username)) return <></>;

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
                        {isFollowingViewer && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>

                <div className='profile-card-bio-overflow' >
                    <p className='bio-content'>{user.profile.bio}</p>
                </div>
            </div>

            {loggedInUser.username !== user.username && (
                <div className='ml-auto [&_button]:py-1'>
                    <FollowButton
                        user={user.username}
                        userState={userState}
                        dispatch={dispatch}
                    />
                </div>
            )}
        </div>
    )
}
