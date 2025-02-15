'use client';
import { useEffect, useRef, useState } from "react";
import ProfileContentTabs from "./ProfileContentTabs";
import ProfilePost from "./posts/ProfilePost";
import ProfileReply from "./posts/ProfileReply";
import ProfileMediaPost from './posts/ProfileMediaPost';
import ProfileLikedPost from "./posts/ProfileLikedPost";
import ProfileLikedPostReply from './posts/ProfileLikedReply';
import { useInView } from "react-intersection-observer";
import { BasicPostType, ProfileInfo, BasicPostOptionalReplyType, ProfilePostOrRepostType, ProfileReplyPostType, BasicPostWithReplyType } from "@/lib/types";
import { getMoreLikesForProfile, getMoreMediaForProfile, getMorePostsForProfile, getMoreRepliesForProfile, getMoreRepostsForProfile, getLikesForProfile, getMediaForProfile, getPostsForProfile, getRepliesForProfile, getRepostsForProfile } from '@/actions/get-actions';

export default function ProfileContent({ userProfile, loggedInUser }: { userProfile: ProfileInfo, loggedInUser: boolean }) {
    const [activeTab, setActiveTab] = useState(0);
    // tab 0
    const [postsReposts, setPostsReposts] = useState<ProfilePostOrRepostType[] | undefined | null>(undefined);
    // tab 1
    const [replies, setReplies] = useState<ProfileReplyPostType[] | undefined | null>(undefined);
    // tab 2
    const [media, setMedia] = useState<BasicPostType[] | undefined | null>(undefined);
    // tab 3
    const [likedPosts, setLikedPosts] = useState<BasicPostOptionalReplyType[] | undefined | null>(undefined);

    const [hasFetchError, setHasFetchError] = useState(false);

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
                    let postsPromise: Promise<{ posts: BasicPostType[], end: boolean; } | { posts: undefined, end: boolean }> | undefined = undefined;
                    let repostsPromise: Promise<{ posts: BasicPostType[], end: boolean; } | { posts: undefined, end: boolean }> | undefined = undefined;

                    if (!postsEndReached && postsCursor) {
                        postsPromise = getMorePostsForProfile(userProfile.username, postsCursor);
                    }

                    if (!repostsEndReached && repostsCursor) {
                        repostsPromise = getMoreRepostsForProfile(userProfile.username, repostsCursor);
                    }
                    const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

                    let fetchedOlderPosts = [] as BasicPostType[] | undefined;
                    if (postsResponse) {
                        const { posts, end } = postsResponse;
                        if (!posts) {
                            setPostsEndReached(true);
                        } else {
                            fetchedOlderPosts = posts;
                            setPostsCursor(fetchedOlderPosts?.slice(-1)[0].id ?? null);
                            setPostsEndReached(end);
                        }
                    }

                    let fetchedOlderReposts = [] as BasicPostType[] | undefined;
                    if (repostsResponse) {
                        const { posts, end } = repostsResponse;
                        if (!posts) {
                            setRepostsEndReached(true);
                        } {
                            fetchedOlderReposts = posts;
                            setRepostsCursor(fetchedOlderReposts?.slice(-1)[0].id ?? null);
                            setRepostsEndReached(end);
                        }
                    }

                    const mappedPosts: ProfilePostOrRepostType[] = fetchedOlderPosts?.map((post) => {
                        return { ...post, timeForSorting: new Date(post.createdAt).getTime(), type: 'POST' };
                    }) ?? [];

                    const mappedReposts: ProfilePostOrRepostType[] = fetchedOlderReposts?.map((repost) => {
                        return { ...repost, timeForSorting: new Date(repost.reposts[0].createdAt as string).getTime(), type: 'REPOST' };
                    }) ?? [];

                    const mappedPostsReposts: ProfilePostOrRepostType[] = mappedPosts.concat(mappedReposts).sort((a, b) => {
                        return b.timeForSorting - a.timeForSorting
                    });

                    setPostsReposts((current) => [...current as ProfilePostOrRepostType[], ...mappedPostsReposts as ProfilePostOrRepostType[]]);
                    setScrollPosition(scrollPositionRef.current);
                } else if (activeTab === 1 && !repliesEndReached && repliesCursor) {
                    const { posts, end } = await getMoreRepliesForProfile(userProfile.username, repliesCursor);
                    if (!posts) {
                        setRepliesEndReached(true);
                    } else {
                        setRepliesCursor(posts.slice(-1)[0].id ?? null);
                        setReplies(current => [...current as ProfileReplyPostType[], ...posts as ProfileReplyPostType[]]);
                        setRepliesEndReached(end);
                    }

                    setScrollPosition(scrollPositionRef.current);
                } else if (activeTab === 2 && !mediaEndReached && mediaCursor) {
                    const { posts, end } = await getMoreMediaForProfile(userProfile.username, mediaCursor);
                    if (!posts) {
                        setMediaEndReached(true);
                    } else {
                        setMediaCursor(posts.length !== 0 ? posts.slice(-1)[0].id : null);
                        setMedia(current => [...current as BasicPostType[], ...posts as BasicPostType[]]);
                        setMediaEndReached(end);
                    }

                    setScrollPosition(scrollPositionRef.current);
                } else if (activeTab === 3 && !likesEndReached && likesCursor) {
                    const { posts, end } = await getMoreLikesForProfile(userProfile.username, likesCursor);
                    if (!posts) {
                        setLikesEndReached(true);
                    } else {
                        setLikesCursor(posts.length !== 0 ? posts.slice(-1)[0].id : null);
                        setLikedPosts(current => [...current as BasicPostOptionalReplyType[], ...posts as BasicPostOptionalReplyType[]]);
                        setLikesEndReached(end);
                    }

                    setScrollPosition(scrollPositionRef.current);
                }
            };

            fetchOldPosts();
        }
    }, [inView, activeTab, userProfile, postsCursor, postsEndReached, repostsCursor, repostsEndReached, repliesCursor, repliesEndReached, mediaCursor, mediaEndReached, likesCursor, likesEndReached, scrollPosition]);

    // Initial replies/likes fetch, save cursor
    useEffect(() => {
        if (activeTab === 1 && replies === undefined) {
            const fetchReplies = async () => {
                try {
                    const { posts, end } = await getRepliesForProfile(userProfile.username);

                    // If request failed, throw an error
                    if (posts === null) {
                        throw new Error("Failed to fetch replies");
                    }

                    setRepliesEndReached(end);
                    setRepliesCursor(posts.length ? posts.slice(-1)[0].id : null);
                    setReplies(posts);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setHasFetchError(true);
                    setRepliesEndReached(true);
                    setRepliesCursor(null);
                    setReplies([]);
                }

                setScrollPosition(scrollPositionRef.current);
            }

            fetchReplies();
        } else if (activeTab === 2 && media === undefined) {
            const fetchMedia = async () => {
                try {
                    const { posts, end } = await getMediaForProfile(userProfile.username);

                    // If request failed, throw an error
                    if (posts === null) {
                        throw new Error("Failed to fetch media");
                    }

                    setMediaEndReached(end);
                    setMediaCursor(posts.length ? posts.slice(-1)[0].id : null);
                    setMedia(posts);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setHasFetchError(true);
                    setMediaEndReached(true);
                    setMediaCursor(null);
                    setMedia([]);
                }
            }

            fetchMedia();
        } else if (activeTab === 3 && likedPosts === undefined) {
            const fetchLikedPosts = async () => {
                try {
                    const { posts, end } = await getLikesForProfile(userProfile.username);

                    // If request failed, throw an error
                    if (posts === null) {
                        throw new Error("Failed to fetch likes");
                    }

                    setLikesEndReached(end);
                    setLikesCursor(posts.length ? posts.slice(-1)[0].id : null);
                    setLikedPosts(posts);
                } catch (error) {
                    console.error("Something went wrong:", error);

                    setHasFetchError(true);
                    setLikesEndReached(true);
                    setLikesCursor(null);
                    setLikedPosts([]);
                }
            }

            fetchLikedPosts();
        }
    }, [userProfile, activeTab, replies, media, likedPosts]);

    // Initial posts/reposts fetch, save cursor
    useEffect(() => {
        const fetchPostsReposts = async () => {
            let postsPromise: Promise<{ posts: BasicPostType[] | null, end: boolean; }> | undefined = undefined;
            let repostsPromise: Promise<{ posts: BasicPostType[] | null, end: boolean; }> | undefined = undefined;

            try {
                postsPromise = getPostsForProfile(userProfile.username);
                repostsPromise = getRepostsForProfile(userProfile.username);

                const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

                // If either request failed, throw an error
                if (!postsResponse || postsResponse.posts === null || !repostsResponse || repostsResponse.posts === null) {
                    throw new Error("Failed to fetch posts or reposts");
                }

                const fetchedPosts: BasicPostType[] = postsResponse.posts;
                const fetchedReposts: BasicPostType[] = repostsResponse.posts;

                setPostsEndReached(postsResponse.end);
                setRepostsEndReached(repostsResponse.end);

                setPostsCursor(fetchedPosts.length ? fetchedPosts.slice(-1)[0].id : null);
                setRepostsCursor(fetchedReposts.length ? fetchedReposts.slice(-1)[0].id : null);

                const mappedPosts: ProfilePostOrRepostType[] = fetchedPosts.map((post) => {
                    return { ...post, timeForSorting: new Date(post.createdAt).getTime(), type: 'POST' };
                });

                const mappedReposts: ProfilePostOrRepostType[] = fetchedReposts.map((repost) => {
                    return { ...repost, timeForSorting: new Date(repost.createdAt).getTime(), type: 'REPOST' };
                });

                const mappedPostsReposts: ProfilePostOrRepostType[] = mappedPosts.concat(mappedReposts).sort((a, b) => {
                    return b.timeForSorting - a.timeForSorting
                });

                setPostsReposts(mappedPostsReposts);
            } catch (error) {
                console.error("Something went wrong:", error);

                setHasFetchError(true);
                setPostsReposts([]);

                setPostsEndReached(true);
                setRepostsEndReached(true);

                setPostsCursor(null);
                setRepostsCursor(null);
            }

            setScrollPosition(scrollPositionRef.current);
        }

        fetchPostsReposts();

        // Track scroll position on user scroll
        function handleScroll() {
            scrollPositionRef.current = window.scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [userProfile]);

    return (
        <div>
            <ProfileContentTabs activeTab={activeTab} setActiveTab={setActiveTab} loggedInUser={loggedInUser} />

            <div className='feed-hr-line'></div>

            {activeTab === 0 && (
                postsReposts === undefined
                    ? <div>loading...</div>
                    : postsReposts && postsReposts.length
                        ? (
                            <section className='w-full flex flex-col h-fit'>
                                {postsReposts.map((post, index) => {
                                    return (
                                        <div key={post.id}>
                                            <ProfilePost post={post} />
                                            {(index + 1) !== postsReposts.length && <div className='feed-hr-line'></div>}
                                        </div>
                                    )
                                })}

                                {(!postsEndReached || !repostsEndReached) && (
                                    <div ref={ref}>
                                        <p>Loading...</p>
                                    </div>
                                )}
                            </section>
                        )
                        : hasFetchError
                            ? <div>Something went wrong</div>
                            : postsReposts && !postsReposts.length && <div> User has no posts</div>

            )}

            {activeTab === 1 && (
                replies === undefined
                    ? <div>loading...</div>
                    : replies && replies.length
                        ? (
                            <section className='w-full flex flex-col h-fit'>
                                {replies.map((post, index) => {
                                    return (
                                        <div key={post.id}>
                                            <ProfileReply post={post} />
                                            {(index + 1) !== replies.length && <div className='feed-hr-line'></div>}
                                        </div>
                                    )
                                })}

                                {(!repliesEndReached) && (
                                    <div ref={ref}>
                                        <p>Loading...</p>
                                    </div>
                                )}
                            </section>
                        )
                        : hasFetchError
                            ? <div>Something went wrong</div>
                            : replies && !replies.length && <div>User has no replies</div>

            )}

            {activeTab === 2 && (
                media === undefined
                    ? <div>loading...</div>
                    : media && media.length
                        ? (
                            <section className='w-full flex flex-col h-fit p-2'>
                                {media.map((post, index) => {
                                    return (
                                        <div key={post.id}>
                                            <ProfileMediaPost post={post} />
                                            {(index + 1) !== media.length && <div className='feed-hr-line'></div>}
                                        </div>
                                    )
                                })}

                                {(!mediaEndReached) && (
                                    <div ref={ref}>
                                        <p>Loading...</p>
                                    </div>
                                )}
                            </section>
                        )
                        : hasFetchError
                            ? <div>Something went wrong</div>
                            : media && !media.length && <div>User has no media</div>

            )}

            {activeTab === 3 && (
                likedPosts === undefined
                    ? <div>loading...</div>
                    : likedPosts && likedPosts.length
                        ? (
                            <section className='w-full flex flex-col h-fit'>
                                {likedPosts.map((post, index) => {
                                    return (
                                        <div key={post.id}>
                                            {post.replyTo
                                                ? <ProfileLikedPostReply post={post as BasicPostWithReplyType} />
                                                : <ProfileLikedPost post={post as BasicPostType} />
                                            }
                                            {(index + 1) !== likedPosts.length && <div className='feed-hr-line'></div>}
                                        </div>
                                    )
                                })}

                                {(!likesEndReached) && (
                                    <div ref={ref}>
                                        <p>Loading...</p>
                                    </div>
                                )}
                            </section>
                        )
                        : hasFetchError
                            ? <div>Something went wrong</div>
                            : likedPosts && !likedPosts.length && <div>User has no likes</div>

            )}

        </div>
    )
}
