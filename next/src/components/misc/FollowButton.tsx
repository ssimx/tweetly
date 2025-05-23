'use client';
import { followUser, unfollowUser } from "@/actions/actions";
import { useFollowSuggestionContext } from "@/context/FollowSuggestionContextProvider";
import { useUserContext } from "@/context/UserContextProvider";
import { UserActionType } from '@/lib/userReducer';
import { useCallback, useState } from "react";
import { getErrorMessage, UserStatsType, UserAndViewerRelationshipType } from 'tweetly-shared';
import { socket } from "@/lib/socket";

type FollowButtonProps = {
    user: string,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function FollowButton({ user, userState, dispatch }: FollowButtonProps) {
    const { updateFollowState } = useFollowSuggestionContext();
    const { setNewFollowing, setFollowingCount } = useUserContext();
    const { loggedInUser } = useUserContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isFollowedByViewer } = userState.relationship;

    const handleFollowToggle = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            if (isSubmitting) return;
            setIsSubmitting(true);

            try {
                if (isFollowedByViewer) {
                    // Optimistically update UI
                    dispatch({ type: 'UNFOLLOW' });
                    updateFollowState(user, false);
                    setNewFollowing(false);
                    setFollowingCount((current) => current - 1);

                    const response = await unfollowUser(user);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }
                } else {
                    // Optimistically update UI
                    dispatch({ type: 'FOLLOW' });
                    updateFollowState(user, true);
                    setNewFollowing(true);
                    setFollowingCount((current) => current + 1);

                    const response = await followUser(user);

                    if (!response.success) {
                        throw new Error(response.error.message);
                    }

                    // send notification to users who have notifications enabled
                    socket.emit('new_user_notification', loggedInUser.id);
                }
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                // Revert state if exception occurs
                if (isFollowedByViewer) {
                    console.error(`Error unfollowing the user:`, errorMessage);
                    dispatch({ type: 'FOLLOW' });
                    updateFollowState(user, true);
                    setNewFollowing(true);
                    setFollowingCount((current) => current + 1);
                } else {
                    console.error(`Error following the user:`, errorMessage);
                    dispatch({ type: 'UNFOLLOW' });
                    updateFollowState(user, false);
                    setNewFollowing(false);
                    setFollowingCount((current) => current - 1);
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [loggedInUser.id, isFollowedByViewer, dispatch, user, isSubmitting, updateFollowState, setFollowingCount, setNewFollowing],
    );

    return (
        <button
            className={`min-w-[100px] border border-primary-border font-bold rounded-[25px] px-4 py-2 text-14
                ${isFollowedByViewer
                    ? "text-primary-text bg-transparent hover:bg-red-500 before:content-['Following'] hover:before:content-['Unfollow']"
                    : "text-white-1 bg-primary hover:bg-primary-dark before:content-['Follow']"}`}
            onClick={handleFollowToggle}
            disabled={isSubmitting}
        ></button>
    );
}
