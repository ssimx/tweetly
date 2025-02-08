'use client';
import { followUser, unfollowUser } from "@/actions/actions";
import { useFollowSuggestionContext } from "@/context/FollowSuggestionContextProvider";
import { useUserContext } from "@/context/UserContextProvider";
import { useEffect, useState } from "react";

interface FollowBtnType {
    username: string;
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>;
    isFollowedByTheUser: boolean;
    setIsFollowedByTheUser: React.Dispatch<React.SetStateAction<boolean>>;
    setNotificationsEnabled?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function FollowBtn({
    username,
    setFollowersCount,
    isFollowedByTheUser,
    setIsFollowedByTheUser,
    setNotificationsEnabled
}: FollowBtnType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { suggestions, updateFollowState } = useFollowSuggestionContext();
    const { setNewFollowing } = useUserContext();

    useEffect(() => {
        if (suggestions?.some((user) => user.username === username)) {
            const following = suggestions.find((user) => user.username === username)?.isFollowing as boolean;
            setIsFollowedByTheUser(following);
        }
    }, [username, suggestions, setIsFollowedByTheUser]);

    const handleFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (isFollowedByTheUser) {
                // UNFOLLOW USER
                // optimistic change
                setIsFollowedByTheUser(false);
                setFollowersCount((current) => current - 1);
                updateFollowState(username, false);

                const unfollow = await unfollowUser(username);
                if (!unfollow) throw new Error("Couldn't unfollow the user");
                return;
            } else {
                // FOLLOW USER
                // optimistic change
                setIsFollowedByTheUser(true);
                setNotificationsEnabled?.(false);
                setFollowersCount((current) => current + 1);
                updateFollowState(username, true);

                const follow = await followUser(username);
                if (!follow) throw new Error("Couldn't follow the user");
                setNewFollowing(true);
                return;
            }
        } catch (error) {
            console.error(error);
            setIsFollowedByTheUser(!isFollowedByTheUser); // Revert on failure
            setFollowersCount((current) => current + (isFollowedByTheUser ? 1 : -1));
            updateFollowState(username, !isFollowedByTheUser);
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
