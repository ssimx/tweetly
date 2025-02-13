'use client';
import { useEffect, useRef, useState } from "react";
import ProfileContentTabs from "./ProfileContentTabs";
import ProfileContentPost from "./posts/ProfilePost";
import ProfileContentReply from "./posts/ProfileReply";
import ProfileContentLikedPost from "./posts/ProfileLikedPost";
import { useInView } from "react-intersection-observer";
import { BasicPostType, ProfileInfo, BasicPostOptionalReplyType, ProfilePostOrRepostType, ProfileReplyPostType, BasicPostWithReplyType } from "@/lib/types";
import ProfileContentMediaPost from './posts/ProfileMediaPost';
import { getMoreLikesForProfile, getMoreMediaForProfile, getMorePostsForProfile, getMoreRepliesForProfile, getMoreRepostsForProfile, getLikesForProfile, getMediaForProfile, getPostsForProfile, getRepliesForProfile, getRepostsForProfile } from '@/actions/get-actions';
import ProfileContentLikedPostReply from './posts/ProfileLikedReply';

export default function ProfileContent({ userProfile, loggedInUser }: { userProfile: ProfileInfo, loggedInUser: boolean }) {
    const [activeTab, setActiveTab] = useState(0);
    // tab 0
    const [postsReposts, setPostsReposts] = useState<ProfilePostOrRepostType[] | undefined>(undefined);
    // tab 1
    const [replies, setReplies] = useState<ProfileReplyPostType[] | undefined>(undefined);
    // tab 2
    const [media, setMedia] = useState<BasicPostType[] | undefined>(undefined);
    // tab 3
    const [likedPosts, setLikedPosts] = useState<BasicPostOptionalReplyType[] | undefined>(undefined);

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
                const { posts, end } = await getRepliesForProfile(userProfile.username);
                console.log(posts)
                if (!posts) {
                    setRepliesEndReached(true);
                    setReplies(undefined);
                } else {
                    setRepliesCursor(posts.slice(-1)[0].id ?? null);
                    setReplies([...posts]);
                    setRepliesEndReached(end);
                }
            }

            fetchReplies();
        } else if (activeTab === 2 && media === undefined) {
            const fetchMedia = async () => {
                const { posts, end } = await getMediaForProfile(userProfile.username);
                if (!posts) {
                    setMediaEndReached(true);
                    setMedia(undefined);
                } else {
                    setMediaCursor(posts.length > 0 ? posts.slice(-1)[0].id : null);
                    setMedia(() => [...posts]);
                    setMediaEndReached(end);
                }
            }

            fetchMedia();
        } else if (activeTab === 3 && likedPosts === undefined) {
            const fetchLikedPosts = async () => {
                const { posts, end } = await getLikesForProfile(userProfile.username);
                if (!posts) {
                    setLikesEndReached(true);
                    setLikedPosts(undefined);
                } else {
                    setLikesCursor(posts.length > 0 ? posts.slice(-1)[0].id : null);
                    setLikedPosts(() => [...posts]);
                    setLikesEndReached(end);
                }
            }

            fetchLikedPosts();
        }
    }, [userProfile, activeTab, replies, media, likedPosts]);

    // Initial posts/reposts fetch, save cursor
    useEffect(() => {
        const fetchPostsReposts = async () => {
            let postsPromise: Promise<{ posts: BasicPostType[], end: boolean; } | { posts: undefined, end: boolean }> | undefined = undefined;
            let repostsPromise: Promise<{ posts: BasicPostType[], end: boolean; } | { posts: undefined, end: boolean }> | undefined = undefined;

            postsPromise = getPostsForProfile(userProfile.username);
            repostsPromise = getRepostsForProfile(userProfile.username);

            const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

            let fetchedPosts = [] as BasicPostType[] | undefined;
            if (postsResponse) {
                const { posts, end } = postsResponse;
                if (!posts) {
                    setPostsEndReached(true);
                } else {
                    fetchedPosts = posts;
                    setPostsCursor(fetchedPosts?.slice(-1)[0].id ?? null);
                    setPostsEndReached(end);
                }
            }

            let fetchedReposts = [] as BasicPostType[] | undefined;
            if (repostsResponse) {
                const { posts, end } = repostsResponse;
                if (!posts) {
                    setRepostsEndReached(true);
                } {
                    fetchedReposts = posts;
                    setRepostsCursor(fetchedReposts?.slice(-1)[0].id ?? null);
                    setRepostsEndReached(end);
                }
            }

            const mappedPosts: ProfilePostOrRepostType[] = fetchedPosts?.map((post) => {
                return { ...post, timeForSorting: new Date(post.createdAt).getTime(), type: 'POST' };
            }) ?? [];

            const mappedReposts: ProfilePostOrRepostType[] = fetchedReposts?.map((repost) => {
                return { ...repost, timeForSorting: new Date(repost.reposts[0].createdAt as string).getTime(), type: 'REPOST' };
            }) ?? [];

            const mappedPostsReposts: ProfilePostOrRepostType[] = mappedPosts.concat(mappedReposts).sort((a, b) => {
                return b.timeForSorting - a.timeForSorting
            });

            setPostsReposts([...mappedPostsReposts as ProfilePostOrRepostType[]]);
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

            {
                activeTab === 0
                    ? postsReposts
                        ? <section className='feed-posts-desktop'>
                            {postsReposts.map((post, index) => {
                                return (
                                    <div key={post.id}>
                                        <ProfileContentPost post={post} />
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
                        : <div>loading...</div>

                    : activeTab === 1
                        ? replies
                            ? <section className='feed-posts-desktop'>
                                {replies.map((reply, index) => {
                                    return (
                                        <div key={reply.id}>
                                            <ProfileContentReply post={reply} />
                                            {(index + 1) !== replies.length && <div className='feed-hr-line'></div>}
                                        </div>
                                    )
                                })}

                                {!repliesEndReached && (
                                    <div ref={ref}>
                                        <p>Loading...</p>
                                    </div>
                                )}
                            </section>
                            : <div>loading...</div>

                        : activeTab === 2
                            ? media
                                ? <section className='feed-posts-desktop'>
                                    <div className='p-2 w-full h-fit grid grid-cols-[repeat(auto-fit,minmax(175px,1fr))] grid-auto-rows gap-2'>
                                        {media.map((post) => (
                                            <ProfileContentMediaPost key={post.id} post={post} />
                                        ))}
                                    </div>

                                    {!mediaEndReached && (
                                        <div ref={ref}>
                                            <p>Loading...</p>
                                        </div>
                                    )}
                                </section>
                                : <div>loading...</div>

                            : activeTab === 3
                                ? likedPosts
                                    ? <section className='feed-posts-desktop'>
                                        {likedPosts.map((post, index) => {
                                            return (
                                                <div key={post.id}>
                                                    {post.replyTo
                                                        ? <ProfileContentLikedPostReply post={post as BasicPostWithReplyType} />
                                                        : <ProfileContentLikedPost post={post as BasicPostType} />
                                                    }
                                                    {(index + 1) !== likedPosts.length && <div className='feed-hr-line'></div>}
                                                </div>
                                            )
                                        })}

                                        {!likesEndReached && (
                                            <div ref={ref}>
                                                <p>Loading...</p>
                                            </div>
                                        )}
                                    </section>
                                    : <div>loading...</div>
                                : null
            }
        </div>
    )
}
