'use client';
import { followUser, unfollowUser } from "@/actions/actions";
import { useFollowSuggestionContext } from "@/context/FollowSuggestionContextProvider";
import { useUserContext } from "@/context/UserContextProvider";
import { useState } from "react";

interface FollowBtnType {
    username: string;
    isFollowedByTheUser: boolean;
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>;
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>;
    setNotificationsEnabled?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function FollowBtn({
    username,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    setFollowersCount,
    setNotificationsEnabled
}: FollowBtnType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { updateFollowState } = useFollowSuggestionContext();
    const { setNewFollowing, setFollowingCount } = useUserContext();

    const handleFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();

        if (isSubmitting) return; 

        setIsSubmitting(true);

        try {
            if (isFollowedByTheUser) {
                // UNFOLLOW USER
                // optimistic change

                // LOGGED IN USER
                // flip following button state, disable notifications, decrease following count
                setIsFollowedByTheUser?.(false);
                setNotificationsEnabled?.(false);
                setFollowingCount((current) => current - 1);

                // FOLLOWED USER SUGGESTION CARD
                // if user is present, flip their follow state and decrease followers count
                updateFollowState(username, false);

                // FOLLOWED USER PROFILE / HOVER CARD
                // flip their followed by logged in user state, decrease followers count
                setFollowersCount?.((current) => current - 1);

                const unfollow = await unfollowUser(username);
                if (!unfollow) {
                    // revert all changes on failure
                    setIsFollowedByTheUser?.(true);
                    setNotificationsEnabled?.((current) => current === true && false);
                    setFollowingCount((current) => current + 1);
                    updateFollowState(username, true);
                    setFollowersCount?.((current) => current + 1);
                    throw new Error("Couldn't unfollow the user")
                };
            } else {
                console.log('testtttttttttt')
                // FOLLOW USER
                // optimistic change

                // LOGGED IN USER
                // flip following button state, increase following count
                setIsFollowedByTheUser?.(true);
                setFollowingCount((current) => current + 1);
                
                // FOLLOWED USER SUGGESTION CARD
                // if user is present, flip their follow state and increase followers count
                updateFollowState(username, true);

                // FOLLOWED USER PROFILE / HOVER CARD
                // increase followers count
                setFollowersCount?.((current) => current + 1);

                const follow = await followUser(username);
                if (!follow) {
                    // revert all changes on failure
                    setIsFollowedByTheUser?.(false);
                    setFollowingCount((current) => current - 1);
                    updateFollowState(username, false);
                    setFollowersCount?.((current) => current - 1);
                    throw new Error("Couldn't follow the user")
                };

                setNewFollowing(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <button
            className={`!w-[100px] follow-btn text-14 ${isFollowedByTheUser ? "following before:content-['Following'] hover:before:content-['Unfollow']" : "before:content-['Follow']"}`}
            onClick={handleFollow}
            disabled={isSubmitting}
        ></button>
    );
}
