'use client';
import { useEffect, useRef, useState } from "react";
import ProfileContentTabs from "./ProfileContentTabs";
import ProfilePost from "./posts/ProfilePost";
import ProfileReply from "./posts/ProfileReply";
import ProfileMediaPost from './posts/ProfileMediaPost';
import ProfileLikedPost from "./posts/ProfileLikedPost";
import ProfileLikedPostReply from './posts/ProfileLikedReply';
import { useInView } from "react-intersection-observer";
import { getLikesForProfile, getMediaForProfile, getRepliesForProfile, getPostsAndRepostsForProfile, getMorePostsAndRepostsForProfile } from '@/actions/get-actions';
import { BasePostDataType, ErrorResponse, getErrorMessage, ProfilePostOrRepostDataType, SuccessResponse, UserAndViewerRelationshipType, UserDataType, UserStatsType } from 'tweetly-shared';
import ProfileNoContent from './ProfileNoContent';
import { UserActionType } from '@/lib/userReducer';
import ProfileRepost from './posts/ProfileRepost';
import ClipLoader from 'react-spinners/ClipLoader';

type ProfileContentProps = {
    user: UserDataType,
    authorized: boolean,
    userState: {
        relationship: UserAndViewerRelationshipType,
        stats: UserStatsType,
    },
    dispatch: React.Dispatch<UserActionType>,
};

export default function ProfileContent({ user, authorized, userState, dispatch }: ProfileContentProps) {
    const [activeTab, setActiveTab] = useState(0);

    // tab 0
    const [postsReposts, setPostsReposts] = useState<ProfilePostOrRepostDataType[] | undefined | null>(undefined);
    // tab 1
    const [replies, setReplies] = useState<BasePostDataType[] | undefined | null>(undefined);
    // tab 2
    const [media, setMedia] = useState<BasePostDataType[] | undefined | null>(undefined);
    // tab 3
    const [likedPosts, setLikedPosts] = useState<BasePostDataType[] | undefined | null>(undefined);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [postsCursor, setPostsCursor] = useState<number | null>(null);
    const [postsEndReached, setPostsEndReached] = useState(false);
    const [repostsCursor, setRepostsCursor] = useState<number | null>(null);
    const [repostsEndReached, setRepostsEndReached] = useState(false);
    const [repliesCursor, setRepliesCursor] = useState<number | null>(null);
    const [repliesEndReached, setRepliesEndReached] = useState(false);
    const [mediaCursor, setMediaCursor] = useState<number | null>(null);
    const [mediaEndReached, setMediaEndReached] = useState(false);
    const [likesCursor, setLikesCursor] = useState<number | null>(null);
    const [likesEndReached, setLikesEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Infinite scroll - fetch older posts when inView is true
    useEffect(() => {
        if (inView && scrollPositionRef.current !== scrollPosition) {
            const fetchOldPosts = async () => {
                if (activeTab === 0 && (!postsEndReached || !repostsEndReached)) {
                    try {
                        const response = await getMorePostsAndRepostsForProfile(user.username, postsCursor, repostsCursor, postsEndReached, repostsEndReached);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response;
                        if (!data) throw new Error('Data is missing in response');
                        else if (data.postsCursor === undefined) throw new Error('postsCursor property is missing in data response');
                        else if (data.postsEnd === undefined) throw new Error('postsEnd property is missing in data response');
                        else if (data.repostsCursor === undefined) throw new Error('repostsCursor property is missing in data response');
                        else if (data.repostsEnd === undefined) throw new Error('repostsEnd property is missing in data response');
                        else if (data.postsReposts === undefined) throw new Error('postsReposts property is missing in data response');

                        setPostsReposts((current) => [...current as ProfilePostOrRepostDataType[], ...data.postsReposts as ProfilePostOrRepostDataType[]]);
                        setPostsCursor(data.postsCursor);
                        setPostsEndReached(data.postsEnd);
                        setRepostsCursor(data.repostsCursor);
                        setRepostsEndReached(data.repostsEnd)
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setPostsCursor(null);
                        setPostsEndReached(true);
                        setRepostsCursor(null);
                        setRepostsEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                } else if (activeTab === 1 && !repliesEndReached && repliesCursor) {
                    try {
                        const response = await getRepliesForProfile(user.username, repliesCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response as SuccessResponse<{ replies: BasePostDataType[], cursor: number, end: boolean }>;
                        if (data === undefined) throw new Error('Data is missing in response');
                        else if (data.replies === undefined) throw new Error('Replies property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setReplies(current => [...current as BasePostDataType[], ...data.replies as BasePostDataType[]]);
                        setRepliesCursor(data.cursor);
                        setRepliesEndReached(data.end);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setRepliesCursor(null);
                        setRepliesEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                } else if (activeTab === 2 && !mediaEndReached && mediaCursor) {
                    try {
                        const response = await getMediaForProfile(user.username, mediaCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response as SuccessResponse<{ media: BasePostDataType[], cursor: number, end: boolean }>;
                        if (data === undefined) throw new Error('Data is missing in response');
                        else if (data.media === undefined) throw new Error('Media property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setMedia(current => [...current as BasePostDataType[], ...data.media as BasePostDataType[]]);
                        setMediaCursor(data.cursor);
                        setMediaEndReached(data.end);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setMediaCursor(null);
                        setMediaEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                } else if (activeTab === 3 && !likesEndReached && likesCursor) {
                    try {
                        const response = await getLikesForProfile(user.username, likesCursor);

                        if (!response.success) {
                            const errorData = response as ErrorResponse;
                            throw new Error(errorData.error.message);
                        }

                        const { data } = response as SuccessResponse<{ likes: BasePostDataType[], cursor: number, end: boolean }>;
                        if (data === undefined) throw new Error('Data is missing in response');
                        else if (data.likes === undefined) throw new Error('Likes property is missing in data response');
                        else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                        setLikedPosts(current => [...current as BasePostDataType[], ...data.likes as BasePostDataType[]]);
                        setLikesCursor(data.cursor);
                        setLikesEndReached(data.end);
                    } catch (error: unknown) {
                        const errorMessage = getErrorMessage(error);
                        console.error(errorMessage);
                        setLikesCursor(null);
                        setLikesEndReached(true);
                    } finally {
                        setScrollPosition(scrollPositionRef.current);
                    }
                }
            };

            fetchOldPosts();
        }
    }, [
        inView,
        activeTab,
        user.username,
        postsReposts,
        postsCursor,
        postsEndReached,
        repostsCursor,
        repostsEndReached,
        repliesCursor,
        repliesEndReached,
        mediaCursor,
        mediaEndReached,
        likesCursor,
        likesEndReached,
        scrollPosition
    ]);

    // Initial replies/likes fetch, save cursor
    useEffect(() => {
        if (activeTab === 0 && postsReposts === undefined) {
            const fetchPostsReposts = async () => {
                try {
                    const response = await getPostsAndRepostsForProfile(user.username);

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response;
                    if (!data) throw new Error('Data is missing in response');
                    else if (data.postsCursor === undefined) throw new Error('postsCursor property is missing in data response');
                    else if (data.postsEnd === undefined) throw new Error('postsEnd property is missing in data response');
                    else if (data.repostsCursor === undefined) throw new Error('repostsCursor property is missing in data response');
                    else if (data.repostsEnd === undefined) throw new Error('repostsEnd property is missing in data response');
                    else if (data.postsReposts === undefined) throw new Error('postsReposts property is missing in data response');

                    setPostsCursor(data.postsCursor);
                    setPostsEndReached(data.postsEnd);
                    setRepostsCursor(data.repostsCursor);
                    setRepostsEndReached(data.repostsEnd)
                    setPostsReposts(data.postsReposts);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setPostsReposts([]);

                    setPostsEndReached(true);
                    setRepostsEndReached(true);

                    setPostsCursor(null);
                    setRepostsCursor(null);
                }

                setScrollPosition(scrollPositionRef.current);
            }

            fetchPostsReposts();
        } else if (activeTab === 1 && replies === undefined) {
            const fetchReplies = async () => {
                try {
                    const response = await getRepliesForProfile(user.username);

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response as SuccessResponse<{ replies: BasePostDataType[], cursor: number, end: boolean }>;
                    if (data === undefined) throw new Error('Data is missing in response');
                    else if (data.replies === undefined) throw new Error('Replies property is missing in data response');
                    else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                    setRepliesEndReached(data.end ?? true);
                    setRepliesCursor(data.cursor);
                    setReplies(data.replies);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setRepliesEndReached(true);
                    setRepliesCursor(null);
                    setReplies([]);
                } finally {
                    setScrollPosition(scrollPositionRef.current);
                }
            }

            fetchReplies();
        } else if (activeTab === 2 && media === undefined) {
            const fetchMedia = async () => {
                try {
                    const response = await getMediaForProfile(user.username);

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response as SuccessResponse<{ media: BasePostDataType[], cursor: number, end: boolean }>;
                    if (data === undefined) throw new Error('Data is missing in response');
                    else if (data.media === undefined) throw new Error('Media property is missing in data response');
                    else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                    setMediaEndReached(data.end ?? true);
                    setMediaCursor(data.cursor);
                    setMedia(data.media);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setMediaEndReached(true);
                    setMediaCursor(null);
                    setMedia([]);
                } finally {
                    setScrollPosition(scrollPositionRef.current);
                }
            }

            fetchMedia();
        } else if (activeTab === 3 && likedPosts === undefined) {
            const fetchLikedPosts = async () => {
                try {
                    const response = await getLikesForProfile(user.username);

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response as SuccessResponse<{ likes: BasePostDataType[], cursor: number, end: boolean }>;
                    if (data === undefined) throw new Error('Data is missing in response');
                    else if (data.likes === undefined) throw new Error('Likes property is missing in data response');
                    else if (data.cursor === undefined) throw new Error('Cursor property is missing in data response');

                    setLikesEndReached(data.end ?? true);
                    setLikesCursor(data.cursor);
                    setLikedPosts(data.likes);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setLikesEndReached(true);
                    setLikesCursor(null);
                    setLikedPosts([]);
                } finally {
                    setScrollPosition(scrollPositionRef.current);
                }
            }

            fetchLikedPosts();
        }
    }, [user.username, activeTab, postsReposts, replies, media, likedPosts]);

    useEffect(() => {
        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className='h-full grid grid-rows-[auto,auto,1fr] border-primary-border'>
            <ProfileContentTabs activeTab={activeTab} setActiveTab={setActiveTab} authorized={authorized} />

            <div className='feed-hr-line'></div>

            {activeTab === 0 && (
                postsReposts === undefined
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
                    : postsReposts === null
                        ? (
                            <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                <p className='text-secondary-text'>Something went wrong.</p>
                                <button
                                    className='w-fit bg-primary text-white-1 hover:bg-primary-dark border border-primary-border font-bold rounded-[25px] px-4 py-2 text-14'
                                    onClick={() => setPostsReposts(undefined)}
                                >
                                    Reload
                                </button>
                            </div>
                        )
                        : postsReposts && postsReposts.length
                            ? (
                                <section className='w-full flex flex-col h-fit'>
                                    {postsReposts.map((post, index) => {
                                        return (
                                            <div key={post.id}>
                                                {post.type === 'REPOST' && (
                                                    <ProfileRepost
                                                        profileUsername={user.username}
                                                        post={post}
                                                        authorized={authorized}
                                                        userState={userState}
                                                        dispatch={dispatch}
                                                    />
                                                )}

                                                {post.type === 'POST' && (
                                                    <ProfilePost
                                                        post={post}
                                                        userState={userState}
                                                        dispatch={dispatch}
                                                    />
                                                )}
                                                
                                                {(index + 1) !== postsReposts.length && <div className='feed-hr-line'></div>}
                                            </div>
                                        )
                                    })}

                                    {(!postsEndReached || !repostsEndReached) && (
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
                                </section>
                            )
                            : postsReposts && !postsReposts.length && (
                                <ProfileNoContent type='POSTS' authorized={authorized} />
                            )
            )}

            {activeTab === 1 && (
                replies === undefined
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
                    : replies === null
                        ? (
                            <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                <p className='text-secondary-text'>Something went wrong.</p>
                                <button
                                    className='w-fit bg-primary text-white-1 hover:bg-primary-dark border border-primary-border font-bold rounded-[25px] px-4 py-2 text-14'
                                    onClick={() => setReplies(undefined)}
                                >
                                    Reload
                                </button>
                            </div>
                        )
                        : replies && replies.length
                            ? (
                                <section className='w-full flex flex-col h-fit'>
                                    {replies.map((post, index) => {
                                        return (
                                            <div key={post.id}>
                                                <ProfileReply
                                                    profileUsername={user.username}
                                                    post={post}
                                                    userState={userState}
                                                    dispatch={dispatch}
                                                />
                                                {(index + 1) !== replies.length && <div className='feed-hr-line'></div>}
                                            </div>
                                        )
                                    })}

                                    {(!repliesEndReached) && (
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
                                </section>
                            )
                            : replies && !replies.length && (
                                <ProfileNoContent type='REPLIES' authorized={authorized} />
                            )
            )}

            {activeTab === 2 && (
                media === undefined
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
                    : media === null
                        ? (
                            <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                <p className='text-secondary-text'>Something went wrong.</p>
                                <button
                                    className='w-fit bg-primary text-white-1 hover:bg-primary-dark border border-primary-border font-bold rounded-[25px] px-4 py-2 text-14'
                                    onClick={() => setMedia(undefined)}
                                >
                                    Reload
                                </button>
                            </div>
                        )
                        : media && media.length
                            ? (
                                <section className='w-full h-fit p-2 grid grid-cols-[repeat(3,minmax(100px,1fr))] lg:grid-cols-[repeat(4,minmax(100px,1fr))] grid-rows-[125px] auto-rows-[125px] gap-2'>
                                    {media.map((post) => {
                                        return (
                                            <div key={post.id}>
                                                <ProfileMediaPost
                                                    post={post}
                                                />
                                            </div>
                                        )
                                    })}

                                    {(!mediaEndReached) && (
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
                                </section>
                            )
                            : media && !media.length && (
                                <ProfileNoContent type='MEDIA' authorized={authorized} />
                            )
            )}

            {activeTab === 3 && (
                likedPosts === undefined
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
                    : likedPosts === null
                        ? (
                            <div className='w-full mt-4 flex flex-col items-center grow gap-4'>
                                <p className='text-secondary-text'>Something went wrong.</p>
                                <button
                                    className='w-fit bg-primary text-white-1 hover:bg-primary-dark border border-primary-border font-bold rounded-[25px] px-4 py-2 text-14'
                                    onClick={() => setLikedPosts(undefined)}
                                >
                                    Reload
                                </button>
                            </div>
                        )
                        : likedPosts && likedPosts.length
                            ? (
                                <section className='w-full flex flex-col h-fit'>
                                    {likedPosts.map((post, index) => {
                                        return (
                                            <div key={post.id}>
                                                {post.replyTo
                                                    ? <ProfileLikedPostReply
                                                        profileUsername={user.username}
                                                        post={post}
                                                        userState={userState}
                                                        dispatch={dispatch}
                                                    />
                                                    : <ProfileLikedPost
                                                        profileUsername={user.username}
                                                        post={post}
                                                        userState={userState}
                                                        dispatch={dispatch}
                                                    />
                                                }
                                                {(index + 1) !== likedPosts.length && <div className='feed-hr-line'></div>}
                                            </div>
                                        )
                                    })}

                                    {(!likesEndReached) && (
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
                                </section>
                            )
                            : likedPosts && !likedPosts.length && (
                                <ProfileNoContent type='LIKES' authorized={authorized} />
                            )
            )}

        </div>
    )
}
