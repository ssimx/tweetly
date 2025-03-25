'use client';
import { getFollowingForProfile } from '@/actions/get-actions';
import ProfileFollowersFollowingCard from "@/components/profile/ProfileFollowersFollowingCard";
import ProfileNoContent from '@/components/profile/ProfileNoContent';
import { useUserContext } from '@/context/UserContextProvider';
import Link from "next/link";
import { useEffect, useState, use, useRef } from "react";
import { useInView } from 'react-intersection-observer';
import ClipLoader from 'react-spinners/ClipLoader';
import { ErrorResponse, getErrorMessage, UserDataType } from 'tweetly-shared';

export default function Following(props: { params: Promise<{ username: string }> }) {
    const params = use(props.params);
    const username = params.username;
    const { loggedInUser } = useUserContext();
    const [following, setFollowing] = useState<UserDataType[] | undefined | null>(undefined);

    const [hasFetchError, setHasFetchError] = useState(false);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [cursor, setCursor] = useState<string | null>(null);
    const [endReached, setEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0.5,
    });

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchMoreFollowing = async () => {
                if (cursor || !endReached) {
                    try {
                        setHasFetchError(false);
                        const response = await getFollowingForProfile(username, cursor!);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.followings === undefined) throw new Error('Followings property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setFollowing((current) => [...current as UserDataType[], ...data.followings as UserDataType[]]);
                        setCursor(data.cursor);
                        setEndReached(data.end ?? true);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setCursor(null);
                        setEndReached(true);
                        setHasFetchError(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                }
            };

            fetchMoreFollowing();
        }
    }, [
        inView,
        username,
        cursor,
        endReached,
        scrollPosition
    ]);

    useEffect(() => {
        const fetchUserFollowing = async () => {
            try {
                setHasFetchError(false);

                const response = await getFollowingForProfile(username);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response;
                if (!data) throw new Error('Data is missing in response');
                else if (data.followings === undefined) throw new Error('Followings property is missing in data response');

                setFollowing(data.followings);
                setCursor(data.cursor ?? null);
                setEndReached(data.end ?? true);
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                console.error(errorMessage);
                setFollowing(null);
                setCursor(null);
                setEndReached(true);
                setHasFetchError(true);
            } finally {
                setScrollPosition(scrollPositionRef.current);
            }
        };

        fetchUserFollowing();

        // Track scroll position on user scroll with throttling
        let ticking = false;

        function handleScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    scrollPositionRef.current = window.scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
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
                            style={{ width: `${('Following').length}ch` }}></div>
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


            {following === undefined
                ? (
                    <div className='w-full flex justify-center mt-6'>
                        <ClipLoader
                            className='loading-spinner'
                            loading={true}
                            size={25}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                )
                : following && following.length
                    ? (
                        <div className='w-full flex flex-col'>
                            {following.map((followee) => (
                                <ProfileFollowersFollowingCard key={followee.username} user={followee} />
                            ))}

                            {(!endReached) && (
                                <div ref={ref} className='w-full flex-center mt-6 mb-6'>
                                    <ClipLoader
                                        className='loading-spinner'
                                        loading={true}
                                        size={25}
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                    />
                                </div>
                            )}
                        </div>
                    )
                    : hasFetchError
                        ? <div>Something went wrong</div>
                        : following && !following.length && <ProfileNoContent type='FOLLOWING' authorized={username === loggedInUser.username} />
            }
        </div>
    )
}
