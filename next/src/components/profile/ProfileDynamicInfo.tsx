'use client';
import { ProfileInfo } from "@/lib/types";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import FollowBtn from "../FollowBtn";
import ProfileEditBtn from "./ProfileEditBtn";
import ProfileNotificationBtn from "./ProfileNotificationBtn";
import ProfileMenuBtn from "./ProfileMenuBtn";
import ProfileContent from "./ProfileContent";
import Link from "next/link";
import ProfileMessageBtn from "./ProfileMessageBtn";
import BlockedInfo from "../BlockedInfo";

export default function ProfileDynamicInfo({ user, loggedInUser }: { user: ProfileInfo, loggedInUser: boolean }) {
    // state for updating followers count when logged in user follows / blocks the profile
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(user.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(user['_count'].followers);

    // state to show whether the profile follows logged in user
    //      and to update the count when logged in user blocks the profile
    const [isFollowingTheUser, setIsFollowingTheUser] = useState(user.following.length === 1);
    const [followingCount, setFollowingCount] = useState(user['_count'].following);

    const [notificationsEnabled, setNotificationsEnabled] = useState(user.notifying.length === 1);
    const [canView, setCanView] = useState(false);
    const [isBlockedByTheUser, setIsBlockedByTheUser] = useState(user.blockedBy.length === 1);
    const hasBlockedTheUser = user.blockedUsers.length === 1;

    const createdAt = new Date(user.createdAt);
    const joined = `${createdAt.toLocaleDateString('default', { month: 'long' })} ${createdAt.getFullYear()}`;

    return (
        <div>
            {loggedInUser
                ? (
                    <div className='edit-profile'>
                        <ProfileEditBtn user={user} />
                    </div>
                )
                : (
                    <div className='profile-interaction'>
                        <ProfileMenuBtn
                            user={user.username}
                            isBlockedByTheUser={isBlockedByTheUser}
                            setIsBlockedByTheUser={setIsBlockedByTheUser}

                            isFollowedByTheUser={isFollowedByTheUser}
                            setIsFollowedByTheUser={setIsFollowedByTheUser}
                            setFollowersCount={setFollowersCount}

                            isFollowingTheUser={isFollowingTheUser}
                            setIsFollowingTheUser={setIsFollowingTheUser}
                            setFollowingCount={setFollowingCount}
                        />
                        {!hasBlockedTheUser && !isBlockedByTheUser && isFollowedByTheUser && (
                            <ProfileMessageBtn profileUser={user.username} conversationId={user.conversationsParticipant.length === 1 ? user.conversationsParticipant[0].conversation.id : undefined} />
                        )}

                        {!hasBlockedTheUser && !isBlockedByTheUser && isFollowedByTheUser && (
                            <ProfileNotificationBtn username={user.username} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} />
                        )}

                        {!hasBlockedTheUser && !isBlockedByTheUser && (
                            <FollowBtn
                                username={user.username}
                                setFollowersCount={setFollowersCount}
                                isFollowedByTheUser={isFollowedByTheUser}
                                setIsFollowedByTheUser={setIsFollowedByTheUser}
                                setNotificationsEnabled={setNotificationsEnabled} />
                        )}
                    </div>
                )
            }


            <div className='px-4 flex flex-col gap-2'>
                <div>
                    <p className='font-bold text-18'>{user.profile.name}</p>
                    <div className='flex gap-2 items-center text-secondary-text'>
                        <p className='text-16'>@{user.username}</p>
                        {isFollowingTheUser && (
                            <p className='bg-secondary-foreground text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>
                {user.profile.bio && (
                    <p className='profile-bio'>{user.profile.bio}</p>
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
                </div>
            </div>

            {!canView && (isBlockedByTheUser || hasBlockedTheUser)
                ? (
                <BlockedInfo 
                    username={user.username}
                    isBlockedByTheUser={isBlockedByTheUser}
                    hasBlockedTheUser={hasBlockedTheUser}
                    setCanView={setCanView} />
                )
                : (
                    <ProfileContent userProfile={user} loggedInUser={loggedInUser} />
                )
            }

        </div>
    )
}
