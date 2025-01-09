'use client';
import ProfileFollowersFollowingCard from "@/components/profile/ProfileFollowersFollowingCard";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FolloweeType {
    followee: {
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

export default function Following({ params }: { params: { username: string } }) {
    const [followees, setFollowees] = useState<FolloweeType[] | undefined>(undefined);
    const username = params.username;

    useEffect(() => {
        const fetchUserFollowing = async () => {
            try {
                const response = await fetch(`/api/users/following/${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })

                const followees: FolloweeType[] = await response.json();

                console.log(followees);


                setFollowees(followees);
            } catch (error) {

            }
        };

        fetchUserFollowing();
    }, [username]);

    return (
        <div>
            <div className='profile-content-header'>
                <div className='profile-content-header-btn'>
                    <button
                        className={`w-full h-full z-10 absolute text-primary-text font-bold`}>
                        Following
                    </button>

                    <div className='w-full flex-center'>
                        <div className='h-[4px] absolute rounded-xl bottom-0 bg-primary z-0'
                            style={{ width: `${('Followers').length}ch` }}></div>
                    </div>
                </div>
                <div className='profile-content-header-btn'>
                    <Link href={`/${username}/followers`}
                        className={`w-full h-full z-10 absolute text-secondary-text font-medium flex-center`}>
                        Followers
                    </Link>
                </div>
            </div>
            <div className='feed-hr-line'></div>


            {!followees
                ? (
                    <div>loading...</div>
                )
                : (
                    <div className='w-full flex flex-col'>
                        {followees.map((element, index) => (
                            <ProfileFollowersFollowingCard key={index} user={{ ...element.followee, type: 'followee' }} />
                        ))
                        }
                    </div>
                )
            }
        </div>
    )
}
