'use client';

import { useFollowSuggestionContext } from "@/context/FollowSuggestionContextProvider";
import { useEffect, useRef, useState } from "react";

interface FollowBtnType {
    username: string,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    isFollowedByTheUser: boolean,
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>,
    setNotificationsEnabled?: React.Dispatch<React.SetStateAction<boolean>>,
};

export default function FollowBtn({
    username,
    setFollowersCount,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    setNotificationsEnabled
}: FollowBtnType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const followBtn = useRef<HTMLButtonElement>(null);
    const { suggestions, updateFollowState } = useFollowSuggestionContext();
    const [isFollowing, setIsFollowing] = useState(isFollowedByTheUser);

    useEffect(() => {
        if (suggestions?.some((user) => user.username === username)) {
            const following = suggestions.find((user) => user.username === username)?.isFollowing as boolean;
            setIsFollowing(following);
        }
    }, [username, suggestions]);

    const handleFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        followBtn.current && followBtn.current.setAttribute('disabled', "");

        try {
            if (isFollowing) {
                // optimistic change
                setIsFollowedByTheUser(false);
                setFollowersCount((current) => current - 1);
                updateFollowState(username, false);

                const unfollow = await fetch(`/api/users/removeFollow/${username}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!unfollow.ok) {
                    throw new Error("Couldn't unfollow the user");
                }

                return;
            } else {
                // optimistic change
                setIsFollowedByTheUser(true);
                setNotificationsEnabled && setNotificationsEnabled(false);
                setFollowersCount((current) => current + 1);
                updateFollowState(username, true);

                const follow = await fetch(`/api/users/follow/${username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!follow.ok) {
                    throw new Error("Couldn't follow the user");
                }

                return;
            }
        } catch (error) {
            console.error(error);
            if (isFollowing) {
                // revert the changes in case of error
                setIsFollowedByTheUser(true);
                setFollowersCount((current) => current + 1);
                updateFollowState(username, true);
            } else {
                // revert the changes in case of error
                setIsFollowedByTheUser(false);
                setNotificationsEnabled && setNotificationsEnabled(true);
                setFollowersCount((current) => current - 1);
                updateFollowState(username, false);
            }
        } finally {
            followBtn.current && followBtn.current.removeAttribute('disabled');
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {
                isFollowing
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
