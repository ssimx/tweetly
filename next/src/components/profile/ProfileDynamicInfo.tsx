'use client';
import { CalendarDays } from "lucide-react";
import { useReducer, useState } from "react";
import FollowButton from "../misc/FollowButton";
import ProfileEditBtn from "./ProfileEditBtn";
import ProfileNotificationBtn from "./ProfileNotificationButton";
import ProfileContent from "./ProfileContent";
import Link from "next/link";
import ProfileMessageBtn from "./ProfileMessageBtn";
import BlockedInfo from "../misc/BlockedInfo";
import { UserDataType } from 'tweetly-shared';
import { userInfoReducer, UserStateType } from '@/lib/userReducer';
import ProfileMenuButton from './ProfileMenuButton';

export default function ProfileDynamicInfo({ user, authorized }: { user: UserDataType, authorized: boolean }) {
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

    const {
        isFollowingViewer,
        hasBlockedViewer,
        isBlockedByViewer,
        isFollowedByViewer,
    } = userState.relationship;

    const {
        followingCount,
        followersCount,
        postsCount
    } = userState.stats;

    // If the viewer has blocked the user, allow them to view posts if they want
    const [canView, setCanView] = useState(false);

    // Format dates
    const createdAt = new Date(user.createdAt);
    const joined = `${createdAt.toLocaleDateString('default', { month: 'long' })} ${createdAt.getFullYear()}`;

    console.log(canView, isBlockedByViewer, hasBlockedViewer,)

    return (
        <div className='h-full grid grid-rows-[auto,auto,1fr]'>
            {authorized
                ? (
                    <div className='w-full h-[55px] flex justify-end items-center pr-5'>
                        <ProfileEditBtn profileInfo={user.profile} />
                    </div>
                )
                : (
                    <div className='w-full h-[55px] flex justify-end items-center gap-2 pr-5'>
                        <ProfileMenuButton
                            user={user.username}
                            userState={userState}
                            dispatch={dispatch}
                        />

                        {!isBlockedByViewer && !hasBlockedViewer && isFollowedByViewer && (
                            <ProfileMessageBtn
                                profileUser={user.username}
                                conversationId={user.messaging?.conversationId ?? null}
                            />
                        )}

                        {!isBlockedByViewer && !hasBlockedViewer && isFollowedByViewer && (
                            <ProfileNotificationBtn
                                user={user.username}
                                userState={userState}
                                dispatch={dispatch}
                            />
                        )}

                        {!isBlockedByViewer && !hasBlockedViewer && (
                            <FollowButton
                                user={user.username}
                                userState={userState}
                                dispatch={dispatch}
                            />
                        )}
                    </div>
                )
            }

            <div className='px-4 flex flex-col gap-2' style={{ marginTop: "clamp(5px, 2.5vw, 50px)" }}>
                <div>
                    <p className='font-bold text-[1.5rem]'>{user.profile.name}</p>
                    <div className='flex gap-2 items-center text-secondary-text'>
                        <p className='text-[1.1rem]'>@{user.username}</p>
                        {isFollowingViewer && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>
                {user.profile.bio && (
                    <p className='break-all'>{user.profile.bio}</p>
                )}

                <div className='flex gap-2'>
                    <CalendarDays size={20} className='text-secondary-text' />
                    <p className='text-secondary-text text-14'>
                        Joined {joined}
                    </p>
                </div>

                <div className='flex gap-4 text-14'>
                    <Link href={`/${user.username}/following`} className='hover:underline'>
                        <p className='font-bold'>{followingCount}
                            <span className='text-secondary-text font-normal'> Following</span>
                        </p>
                    </Link>

                    <Link href={`/${user.username}/followers`} className='hover:underline'>
                        <p className='font-bold'>{followersCount}
                            <span className='text-secondary-text font-normal'> Followers</span>
                        </p>
                    </Link>

                    <p className='text-secondary-text font-bold'>{postsCount}
                        <span className='text-secondary-text font-normal'> Posts</span>
                    </p>
                </div>
            </div>

            {!canView && (isBlockedByViewer || hasBlockedViewer)
                ? (
                    <BlockedInfo
                        username={user.username}
                        isBlockedByTheUser={isBlockedByViewer}
                        hasBlockedTheUser={hasBlockedViewer}
                        setCanView={setCanView} />
                )
                : (
                    <ProfileContent
                        user={user}
                        authorized={authorized}
                        userState={userState}
                        dispatch={dispatch}
                    />
                )
            }

        </div>
    )
}
