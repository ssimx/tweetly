'use client';
import { ProfileInfo } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import ProfileContentTabs from "./ProfileContentTabs";
import ProfileContentPost from "./ProfileContentPost";
import ProfileContentReply from "./ProfileContentReply";
import ProfileContentLikedPost from "./ProfileContentLikedPost";
import { useInView } from "react-intersection-observer";

interface Post {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

interface MappedPost extends Post {
    timeForSorting: number,
    repost: boolean,
};

interface Repost {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    repost: boolean,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
        createdAt: string,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

interface MappedRepost extends Repost {
    timeForSorting: number,
    repost: boolean,
};

export interface PostRepost {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    repost: boolean,
    timeForSorting: number,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
        createdAt?: string,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

export interface Reply {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    replyTo: {
        id: number,
        content: true,
        createdAt: string,
        updatedAt: string,
        author: {
            username: string,
            profile: {
                name: string,
                profilePicture: string,
                bio: string,
            },
            followers: {
                followerId: number,
            }[] | [],
            following: {
                followeeId: number,
            }[] | [],
            _count: {
                select: {
                    followers: true,
                    following: true,
                }
            }
        },
        reposts: {
            userId: number,
        }[] | [],
        likes: {
            userId: number,
        }[] | [],
        bookmarks: {
            userId: number,
        }[] | [],
        _count: {
            replies: number,
            reposts: number,
            likes: number,
        },
    },
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

export interface LikedPost {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    replyTo: {
        author: {
            username: string,
            profile: {
                name: string,
                profilePicture: string,
                bio: string
            },
            followers: {
                followerId: number,
            }[] | [],
            following: {
                followeeId: number,
            }[] | [],
            _count: {
                followers: number,
                following: number,
            }
        }
    } | null,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        followers: {
            followerId: number,
        }[] | [],
        following: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        }
    },
    reposts: {
        userId: number,
    }[] | [],
    likes: {
        userId: number,
    }[] | [],
    bookmarks: {
        userId: number,
    }[] | [],
    _count: {
        replies: number,
        reposts: number,
        likes: number,
    }
};

interface LikedPostResponse {
    post: LikedPost
};

export default function ProfileContent({ userProfile, loggedInUser }: { userProfile: ProfileInfo, loggedInUser: boolean }) {
    const [postsReposts, setPostsReposts] = useState<PostRepost[] | undefined>(undefined);
    const [replies, setReplies] = useState<Reply[] | undefined>(undefined);
    const [likedPosts, setLikedPosts] = useState<LikedPostResponse[] | undefined>(undefined);
    const [activeTab, setActiveTab] = useState(0);

    // scroll and pagination
    const scrollPositionRef = useRef<number>(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [postsCursor, setPostsCursor] = useState<number>();
    const [repostsCursor, setRepostsCursor] = useState<number>();
    const [repliesCursor, setRepliesCursor] = useState<number>();
    const [likesCursor, setLikesCursor] = useState<number>();
    const [endReached, setEndReached] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    // Initial posts/reposts fetch, save cursor
    useEffect(() => {
        const fetchPostsReposts = async () => {
            const postsPromise = fetch(`/api/posts/posts/${userProfile.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const repostsPromise = fetch(`/api/posts/reposts/${userProfile.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

            const posts: Post[] = await postsResponse.json();
            const reposts: Repost[] = await repostsResponse.json();

            console.log(posts);
            

            setPostsCursor(posts.length > 0 ? posts[posts.length - 1].id : 0);
            setRepostsCursor(reposts.length > 0 ? reposts[reposts.length - 1].id : 0)

            const mappedPosts: MappedPost[] = posts.map((post) => {
                return { ...post, timeForSorting: new Date(post.createdAt).getTime(), repost: false };
            });

            const mappedReposts: MappedRepost[] = reposts.map((repost) => {
                return { ...repost, timeForSorting: new Date(repost.reposts[0].createdAt).getTime(), repost: true };
            });

            const mappedPostsReposts = mappedPosts.concat(mappedReposts).sort((a, b) => {
                return b.timeForSorting - a.timeForSorting
            });

            setPostsReposts(mappedPostsReposts as PostRepost[]);
        }

        fetchPostsReposts();
    }, [userProfile]);

    // Initial replies/likes fetch, save cursor
    useEffect(() => {
        if (activeTab === 1 && replies === undefined) {
            const fetchReplies = async () => {
                const repliesResponse = await fetch(`/api/posts/replies/${userProfile.username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const replies: Reply[] = await repliesResponse.json();
                setReplies(replies);
                setRepliesCursor(replies.length > 0 ? replies[replies.length - 1].id : 0)
            }

            fetchReplies();
        } else if (activeTab === 3 && likedPosts === undefined) {
            const fetchLikedPosts = async () => {
                const likedPostsResponse = await fetch(`/api/posts/likedPosts`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                const likedPosts: LikedPostResponse[] = await likedPostsResponse.json();
                setLikedPosts(likedPosts);
                setLikesCursor(likedPosts[likedPosts.length === 0 ? 0 : likedPosts.length - 1].post.id)
            }

            fetchLikedPosts();
        }
    }, [userProfile, activeTab, replies, likedPosts]);

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
                                        <div className='feed-hr-line'></div>
                                    </div>
                                )
                            })}
                        </section>
                        : <div>loading...</div>

                    : activeTab === 1
                        ? replies
                            ? <section className='feed-posts-desktop'>
                                {replies.map((reply, index) => {
                                    return (
                                        <div key={index}>
                                            <ProfileContentReply replyPost={reply} />
                                            <div className='feed-hr-line'></div>
                                        </div>
                                    )
                                })}
                            </section>
                            : <div>loading...</div>

                        : activeTab === 3
                            ? likedPosts
                                ? <section className='feed-posts-desktop'>
                                    {likedPosts.map((post, index) => {
                                        return (
                                            <div key={index}>
                                                <ProfileContentLikedPost post={post.post} />
                                                <div className='feed-hr-line'></div>
                                            </div>
                                        )
                                    })}
                                </section>
                                : <div>loading...</div>

                            : null
            }
        </div>
    )
}
