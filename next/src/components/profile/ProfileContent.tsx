'use client';
import { useEffect, useRef, useState } from "react";
import ProfileContentTabs from "./ProfileContentTabs";
import ProfileContentPost from "./ProfileContentPost";
import ProfileContentReply from "./ProfileContentReply";
import ProfileContentLikedPost from "./ProfileContentLikedPost";
import { useInView } from "react-intersection-observer";
import ProfileContentMedia from "./ProfileContentMedia";
import { BasicPostType, ProfileInfo, ProfileLikedPostType, ProfilePostOrRepostType, ProfileReplyPostType } from "@/lib/types";


export default function ProfileContent({ userProfile, loggedInUser }: { userProfile: ProfileInfo, loggedInUser: boolean }) {
    const [activeTab, setActiveTab] = useState(2);
    // tab 0
    const [postsReposts, setPostsReposts] = useState<ProfilePostOrRepostType[] | undefined>(undefined);
    // tab 1
    const [replies, setReplies] = useState<ProfileReplyPostType[] | undefined>(undefined);
    // tab 2
    const [media, setMedia] = useState<BasicPostType[] | undefined>(undefined);
    // tab 3
    const [likedPosts, setLikedPosts] = useState<ProfileLikedPostType[] | undefined>(undefined);

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
                    let postsPromise: Promise<Response> | undefined = undefined;
                    let repostsPromise: Promise<Response> | undefined = undefined;

                    if (!postsEndReached) {
                        postsPromise = fetch(`/api/posts/userPosts/${userProfile.username}?cursor=${postsCursor}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                    }

                    if (!repostsEndReached) {
                        repostsPromise = fetch(`/api/posts/userReposts/${userProfile.username}?cursor=${repostsCursor}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                    }
                    const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

                    let fetchedOlderPosts: BasicPostType[] = [];
                    if (postsResponse) {
                        const { olderPosts, end } = await postsResponse.json() as { olderPosts: BasicPostType[], end: boolean };
                        fetchedOlderPosts = olderPosts;
                        setPostsCursor(olderPosts.length !== 0 ? olderPosts.slice(-1)[0].id : null);
                        setPostsEndReached(end);
                    }

                    let fetchedOlderReposts = [] as BasicPostType[];
                    if (repostsResponse) {
                        const { olderReposts, end } = await repostsResponse.json() as { olderReposts: BasicPostType[], end: boolean };
                        fetchedOlderReposts = olderReposts;
                        setRepostsCursor(olderReposts.length !== 0 ? olderReposts.slice(-1)[0].id : null);
                        setRepostsEndReached(end);
                    }

                    const mappedPosts: ProfilePostOrRepostType[] = fetchedOlderPosts.map((post) => {
                        return { ...post, timeForSorting: new Date(post.createdAt).getTime(), type: 'POST' };
                    });

                    const mappedReposts: ProfilePostOrRepostType[] = fetchedOlderReposts.map((repost) => {
                        return { ...repost, timeForSorting: new Date(repost.reposts[0].createdAt as string).getTime(), type: 'REPOST' };
                    });

                    const mappedPostsReposts: ProfilePostOrRepostType[] = mappedPosts.concat(mappedReposts).sort((a, b) => {
                        return b.timeForSorting - a.timeForSorting
                    });

                    setPostsReposts((current) => [...current as ProfilePostOrRepostType[], ...mappedPostsReposts as ProfilePostOrRepostType[]]);
                    setScrollPosition(scrollPositionRef.current);
                } else if (activeTab === 1 && !repliesEndReached) {
                    const response = await fetch(`/api/posts/userReplies/${userProfile.username}?cursor=${repliesCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const { olderReplies, end } = await response.json() as { olderReplies: ProfileReplyPostType[], end: boolean };

                    setRepliesCursor(olderReplies.length !== 0 ? olderReplies.slice(-1)[0].id : null);
                    setReplies(current => [...current as ProfileReplyPostType[], ...olderReplies as ProfileReplyPostType[]]);
                    setScrollPosition(scrollPositionRef.current);
                    setRepliesEndReached(end);
                } else if (activeTab === 2 && !mediaEndReached) {
                    const response = await fetch(`/api/posts/userMedia/${userProfile.username}?cursor=${repliesCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const { olderMedia, end } = await response.json() as { olderMedia: BasicPostType[], end: boolean };

                    setMediaCursor(olderMedia.length !== 0 ? olderMedia.slice(-1)[0].id : null);
                    setMedia(current => [...current as BasicPostType[], ...olderMedia as BasicPostType[]]);
                    setScrollPosition(scrollPositionRef.current);
                    setMediaEndReached(end);
                } else if (activeTab === 3 && !likesEndReached) {
                    const response = await fetch(`/api/posts/userLikes?cursor=${likesCursor}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const { olderLikes, end } = await response.json() as { olderLikes: ProfileLikedPostType[], end: boolean };

                    setLikesCursor(olderLikes.length !== 0 ? olderLikes.slice(-1)[0].id : null);
                    setLikedPosts(current => [...current as ProfileLikedPostType[], ...olderLikes as ProfileLikedPostType[]]);
                    setScrollPosition(scrollPositionRef.current);
                    setLikesEndReached(end);
                }
            };

            fetchOldPosts();
        }
    }, [inView, activeTab, userProfile, postsCursor, postsEndReached, repostsCursor, repostsEndReached, repliesCursor, repliesEndReached, mediaCursor, mediaEndReached, likesCursor, likesEndReached, scrollPosition]);

    // Initial replies/likes fetch, save cursor
    useEffect(() => {
        if (activeTab === 1 && replies === undefined) {
            const fetchReplies = async () => {
                const repliesResponse = await fetch(`/api/posts/userReplies/${userProfile.username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const { replies, end } = await repliesResponse.json() as { replies: ProfileReplyPostType[], end: boolean };
                setReplies(() => [...replies]);
                setRepliesCursor(replies.length > 0 ? replies.slice(-1)[0].id : null);
                setRepliesEndReached(end);
            }

            fetchReplies();
        } else if (activeTab === 2 && media === undefined) {
            const fetchMedia = async () => {
                const response = await fetch(`/api/posts/userMedia/${userProfile.username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const { media, end } = await response.json() as { media: BasicPostType[], end: boolean };
                setMedia(() => [...media]);
                setMediaCursor(media.length > 0 ? media.slice(-1)[0].id : null);
                setMediaEndReached(end);
            }

            fetchMedia();
        } else if (activeTab === 3 && likedPosts === undefined) {
            const fetchLikedPosts = async () => {
                const response = await fetch(`/api/posts/userLikes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const { likes, end } = await response.json() as { likes: ProfileLikedPostType[], end: boolean };
                setLikedPosts(() => [...likes]);
                setLikesCursor(likes.length > 0 ? likes.slice(-1)[0].id : null);
                setLikesEndReached(end);
            }

            fetchLikedPosts();
        }
    }, [userProfile, activeTab, replies, media, likedPosts]);

    // Initial posts/reposts fetch, save cursor
    useEffect(() => {
        const fetchPostsReposts = async () => {
            const postsPromise = fetch(`/api/posts/userPosts/${userProfile.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const repostsPromise = fetch(`/api/posts/userReposts/${userProfile.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

            let fetchedPosts: BasicPostType[] = [];
            if (postsResponse) {
                const { posts, end } = await postsResponse.json() as { posts: BasicPostType[], end: boolean };
                setPostsCursor(posts.length > 0 ? posts.slice(-1)[0].id : null);
                fetchedPosts = posts;
                setPostsEndReached(end);
            }

            let fetchedReposts = [] as BasicPostType[];
            if (repostsResponse) {
                const { reposts, end } = await repostsResponse.json() as { reposts: BasicPostType[], end: boolean };
                fetchedReposts = reposts;
                setRepostsCursor(reposts.length > 0 ? reposts.slice(-1)[0].id : null);
                setRepostsEndReached(end);
            }

            const mappedPosts: ProfilePostOrRepostType[] = fetchedPosts.map((post) => {
                return { ...post, timeForSorting: new Date(post.createdAt).getTime(), type: 'POST' };
            });

            const mappedReposts: ProfilePostOrRepostType[] = fetchedReposts.map((repost) => {
                return { ...repost, timeForSorting: new Date(repost.reposts[0].createdAt as string).getTime(), type: 'REPOST' };
            });

            const mappedPostsReposts = mappedPosts.concat(mappedReposts).sort((a, b) => {
                return b.timeForSorting - a.timeForSorting
            });

            setPostsReposts(mappedPostsReposts);
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
                                    <div key={index}>
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
                                        <div key={index}>
                                            <ProfileContentReply replyPost={reply} />
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
                                    <ProfileContentMedia media={media} loadingRef={ref} scrollPositionRef={scrollPositionRef} endReached={mediaEndReached} />
                                </section>
                                : <div>loading...</div>

                            : activeTab === 3
                                ? likedPosts
                                    ? <section className='feed-posts-desktop'>
                                        {likedPosts.map((post, index) => {
                                            return (
                                                <div key={index}>
                                                    <ProfileContentLikedPost post={post} />
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
