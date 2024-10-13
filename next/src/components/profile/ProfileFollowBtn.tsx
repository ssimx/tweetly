'use client';

import { useRef, useState } from "react";

interface FollowBtnType {
    username: string,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
};

export default function ProfileFollowBtn({
    username,
    setFollowersCount,
    isFollowedByTheUser,
    setIsFollowedByTheUser
}: FollowBtnType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const followBtn = useRef<HTMLButtonElement>(null);


    const handleFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        followBtn.current && followBtn.current.setAttribute('disabled', "");

        try {
            if (isFollowedByTheUser) {
                const unfollow = await fetch(`/api/users/removeFollow/${username}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!unfollow) throw new Error("Couldn't unfollow the user");

                setIsFollowedByTheUser(false);
                setFollowersCount((current) => current - 1);
                return;
            } else {
                const follow = await fetch(`/api/users/follow/${username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!follow) throw new Error("Couldn't follow the user");

                setIsFollowedByTheUser(true);
                setFollowersCount((current) => current + 1);
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            followBtn.current && followBtn.current.removeAttribute('disabled');
            setIsSubmitting(false);
        }
    };
    
    return (
        <div>
            {
                isFollowedByTheUser
                    ? (
                        <button
                            className="!w-[100px] follow-btn following text-14 before:content-['Following'] hover:before:content-['Unfollow']"
                            onClick={(e) => handleFollow(e)} ref={followBtn} >
                        </button>
                    )
                    : <button className='!w-[100px] follow-btn text-14' onClick={handleFollow} ref={followBtn}>
                        Follow
                    </button>

            }
        </div>
    )
}
