'use client';
import { followUser, unfollowUser } from "@/actions/actions";
import { useFollowSuggestionContext } from "@/context/FollowSuggestionContextProvider";
import { useUserContext } from "@/context/UserContextProvider";
import { UserActionType } from '@/lib/userReducer';
import { useCallback, useState } from "react";
import { getErrorMessage, UserStatsType, UserAndViewerRelationshipType } from 'tweetly-shared';

type FollowButtonProps = {
    user: string,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function FollowButton({ user, userState, dispatch }: FollowButtonProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { updateFollowState } = useFollowSuggestionContext();
    const { setNewFollowing, setFollowingCount } = useUserContext();
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
        [isFollowedByViewer, dispatch, user, isSubmitting, updateFollowState, setFollowingCount, setNewFollowing],
    );

    return (
        <button
            className={`!w-[100px] follow-btn text-14 ${isFollowedByViewer ? "following before:content-['Following'] hover:before:content-['Unfollow']" : "before:content-['Follow']"}`}
            onClick={handleFollowToggle}
            disabled={isSubmitting}
        ></button>
    );
}
