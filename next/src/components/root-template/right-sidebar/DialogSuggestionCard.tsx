'use client';
import { useEffect, useReducer } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserHoverCard from '@/components/misc/UserHoverCard';
import FollowButton from '@/components/misc/FollowButton';
import { useBlockedUsersContext } from '@/context/BlockedUsersContextProvider';
import { UserDataType } from 'tweetly-shared';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';

export default function DialogSuggestionCard({ user }: { user: UserDataType }) {
    const { blockedUsers } = useBlockedUsersContext();
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
        dispatch({
            type: 'UPDATE_USER',
            payload: {
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
            }
        })
    }, [user]);

    useEffect(() => {
        if (blockedUsers?.some((blockedUser) => blockedUser === user.username)) {
            dispatch({ type: 'BLOCK' });
        }
    }, [blockedUsers, user.username]);

    // - FUNCTIONS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleCardClick = () => {
        router.push(`/${user.username}`);
    };

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    if (blockedUsers.some((username) => username === user.username)) return <></>;

    return (
        <div onClick={handleCardClick} className='w-full h-fit px-4 py-3 grid grid-cols-[max-content,auto,max-content] gap-4 bg-primary-foreground hover:bg-card-hover cursor-pointer'>
            <div>
                <Image
                    src={user.profile.profilePicture || 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png'}
                    height={40} width={40}
                    alt='Follower profile pic'
                    className='rounded-full min-w-[40px]' />
            </div>

            <div className='min-w-0 flex flex-col leading-5'>
                <div className='flex gap-x-2 items-center text-secondary-text '>
                    <div className='truncate'>
                        <UserHoverCard
                            user={user}
                            userState={userState}
                            dispatch={dispatch}
                        />
                    </div>

                    <div className='min-w-0 flex-center gap-2'>
                        <p className='text-16 truncate'>@{user.username}</p>
                    </div>
                </div>

                <div className='profile-card-bio-overflow' >
                    <p className='bio-content'>{user.profile.bio}</p>
                </div>
            </div>

            <div className='flex flex-col justify-center items-center gap-1 [&_button]:py-1'>
                <FollowButton
                    user={user.username}
                    userState={userState}
                    dispatch={dispatch}
                />
                {isFollowingViewer && (
                    <p className='text-center bg-secondary-foreground text-12 text-secondary-text px-2 py-1 rounded-sm w-fit h-fit mt-[2px] font-medium'>Follows you</p>
                )}
            </div>
        </div>
    )
}
