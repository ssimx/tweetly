'use client';

import { ProfileInfo } from "@/lib/types";
import { CalendarDays, BellOff } from "lucide-react";
import { useState } from "react";
import ProfileFollowBtn from "./ProfileFollowBtn";
import ProfileEditBtn from "./ProfileEditBtn";
import ProfileNotificationBtn from "./ProfileNotificationBtn";
import ProfileMenuBtn from "./ProfileMenuBtn";
import ProfileContent from "./ProfileContent";


export default function ProfileDynamicInfo({ user, loggedInUser }: { user: ProfileInfo, loggedInUser: boolean }) {
    // state for updating followers count when logged in user follows / blocks the profile
    const [isFollowedByTheUser, setIsFollowedByTheUser] = useState(user.followers.length === 1);
    const [followersCount, setFollowersCount] = useState(user['_count'].followers);

    // state to show whether the profile follows logged in user
    //      and to update the count when logged in user blocks the profile
    const [isFollowingTheUser, setIsFollowingTheUser] = useState(user.following.length === 1);
    const [followingCount, setFollowingCount] = useState(user['_count'].following);

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [viewPosts, setViewPosts] = useState(false);
    const [isBlockedByTheUser, setIsBlockedByTheUser] = useState(user.blockedBy.length === 1);
    const hasBlockedTheUser = user.blockedUsers.length === 1;

    const createdAt = new Date(user.createdAt);
    const joined = `${createdAt.toLocaleDateString('default', { month: 'long' })} ${createdAt.getFullYear()}`;

    console.log(user);

    const handleViewPosts = () => {
        setViewPosts((prev) => !prev);
    };

    return (
        <div>
            { loggedInUser 
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
                        {!hasBlockedTheUser && !isBlockedByTheUser && isFollowingTheUser && (
                            <ProfileNotificationBtn username={user.username} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} />
                        )}

                        { !hasBlockedTheUser && !isBlockedByTheUser && (
                            <ProfileFollowBtn username={user.username} setFollowersCount={setFollowersCount} isFollowedByTheUser={isFollowedByTheUser} setIsFollowedByTheUser={setIsFollowedByTheUser} />
                        )}
                    </div>
                )
            }


            <div className='px-4 flex flex-col gap-2'>
                <div>
                    <p className='font-bold text-18'>{user.profile.name}</p>
                    <div className='flex gap-2 items-center text-dark-500'>
                        <p className='text-16'>@{user.username}</p>
                        { isFollowingTheUser && (
                            <p className='bg-dark-300 text-12 px-1 rounded-sm h-fit mt-[2px] font-medium'>Follows you</p>
                        )}
                    </div>
                </div>
                {user.profile.bio && (
                    <p className='profile-bio'>{user.profile.bio}</p>
                )}

                <div className='flex gap-2'>
                    <CalendarDays size={20} className='text-dark-500' />
                    <p className='text-dark-500 text-14'>
                        Joined {joined}
                    </p>
                </div>

                <div className='flex gap-4'>
                    <p className='font-bold'>{followingCount}
                        <span className='text-dark-500 font-normal'> Following</span>
                    </p>
                    <p className='font-bold'>{followersCount}
                        <span className='text-dark-500 font-normal'> Followers</span>
                    </p>
                </div>
            </div>
            
            { hasBlockedTheUser
                ? (
                    <div>
                        <div className='mt-2 feed-hr-line'></div>
                        <div className='w-full h-full flex flex-col items-center gap-2 px-10'>
                            <h1 className='mt-5 text-20 font-bold'>You are blocked</h1>
                            <p className='mb-auto'>You can&apos;t follow or see @{`${user.username}'s`} post.</p>
                        </div>
                    </div>
                )
                : !viewPosts && isBlockedByTheUser
                    ? (
                        <div>
                            <div className='mt-2 feed-hr-line'></div>
                            <div className='w-full h-full flex flex-col items-center gap-2 px-[5%]'>
                                <h1 className='mt-5 text-20 font-bold'>@{`${user.username}`} is blocked</h1>
                                <div>
                                    <p>Are you sure you want to view these posts?</p>
                                    <p className='mb-auto'>Viewing posts won&apos;t unblock @{`${user.username}`}</p>
                                </div>
                                <button 
                                    className='mt-2 border-primary border px-4 py-2 rounded-xl text-primary font-bold hover:bg-primary hover:text-white-1'
                                    onClick={handleViewPosts} >
                                        View Posts
                                </button>
                            </div>
                        </div>
                    )
                    : <ProfileContent userProfile={user} loggedInUser={loggedInUser} />
            }
        </div>
    )
}
