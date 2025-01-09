'use client';
import ProfileFollowersFollowingCard from "@/components/profile/ProfileFollowersFollowingCard";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FollowerType {
    follower: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        blockedBy: {
            blockerId: number,
        }[] | [],
        blockedUsers: {
            blockedId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    };
};

export default function Followers({ params }: { params: { username: string } }) {
    const [followers, setFollowers] = useState<FollowerType[] | undefined>(undefined);
    const username = params.username;

    useEffect(() => {
        const fetchUserFollowers = async () => {
            try {
                const response = await fetch(`/api/users/followers/${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })

                const followers: FollowerType[] = await response.json();

                console.log(followers);


                setFollowers(followers);
            } catch (error) {

            }
        };

        fetchUserFollowers();
    }, [username]);

    return (
        <div>
            <div className='profile-content-header'>
                <div className='profile-content-header-btn'>
                    <Link href={`/${username}/following`}
                        className={`w-full h-full z-10 absolute text-secondary-text font-medium flex-center`}>
                        Following
                    </Link>
                </div>
                <div className='profile-content-header-btn'>
                    <button
                        className={`w-full h-full z-10 absolute text-primary-text font-bold`}>
                        Followers
                    </button>
                    <div className='w-full flex-center'>
                        <div className='h-[4px] absolute rounded-xl bottom-0 bg-primary z-0'
                            style={{ width: `${('Followers').length}ch` }}></div>
                    </div>
                </div>
            </div>
            <div className='feed-hr-line'></div>


            {!followers
                ? (
                    <div>loading...</div>
                )
                : (
                    <div className='w-full flex flex-col'>
                        {followers.map((element, index) => (
                            <ProfileFollowersFollowingCard key={index} user={{ ...element.follower, type: 'follower' }} />
                        ))
                        }
                    </div>
                )
            }
        </div>
    )
}
