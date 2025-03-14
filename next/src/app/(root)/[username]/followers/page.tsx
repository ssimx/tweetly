'use client';
import { getFollowersForProfile } from '@/actions/get-actions';
import ProfileFollowersFollowingCard from "@/components/profile/ProfileFollowersFollowingCard";
import ProfileNoContent from '@/components/profile/ProfileNoContent';
import { useUserContext } from '@/context/UserContextProvider';
import Link from "next/link";
import { useEffect, useState, use, useRef } from "react";
import { useInView } from 'react-intersection-observer';
import ClipLoader from 'react-spinners/ClipLoader';
import { ErrorResponse, getErrorMessage, UserDataType } from 'tweetly-shared';

export default function Followers(props: { params: Promise<{ username: string }> }) {
    const params = use(props.params);
    const username = params.username;
    const { loggedInUser } = useUserContext();
    const [followers, setFollowers] = useState<UserDataType[] | undefined | null>(undefined);

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
            const fetchMoreFollowers = async () => {
                if (cursor || !endReached) {
                    console.log('test')
                    try {
                        setHasFetchError(false);
                        const response = await getFollowersForProfile(username, cursor!);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.followers === undefined) throw new Error('Followers property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setFollowers((current) => [...current as UserDataType[], ...data.followers as UserDataType[]]);
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

            fetchMoreFollowers();
        }
    }, [
        inView,
        username,
        cursor,
        endReached,
        scrollPosition
    ]);

    useEffect(() => {
        const fetchUserFollowers = async () => {
            try {
                setHasFetchError(false);

                const response = await getFollowersForProfile(username);

                if (!response.success) {
                    const errorData = response as ErrorResponse;
                    throw new Error(errorData.error.message);
                }

                const { data } = response;
                if (!data) throw new Error('Data is missing in response');
                else if (data.followers === undefined) throw new Error('Followers property is missing in data response');

                setFollowers(data.followers);
                setCursor(data.cursor ?? null);
                setEndReached(data.end ?? true);
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                console.error(errorMessage);
                setFollowers(null);
                setCursor(null);
                setEndReached(true);
                setHasFetchError(true);
            } finally {
                setScrollPosition(scrollPositionRef.current);
            }
        };

        fetchUserFollowers();

        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
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


            {followers === undefined
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
                : followers && followers.length
                    ? (
                        <div className='w-full flex flex-col'>
                            {followers.map((follower) => (
                                <ProfileFollowersFollowingCard key={follower.username} user={follower} />
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
                        : followers && !followers.length && <ProfileNoContent type='FOLLOWERS' authorized={username === loggedInUser.username} />
            }
        </div>
    )
}
