'use client';
import { ProfileInfo } from "@/lib/types";
import { useEffect, useState } from "react";
import ProfileContentTabs from "./ProfileContentTabs";
import ProfileContentPost from "./ProfileContentPost";
import ProfileContentReply from "./ProfileContentReply";

interface Post {
    id: number,
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
}

export default function ProfileContent({ user }: { user: ProfileInfo }) {
    const [postsReposts, setPostsReposts] = useState<PostRepost[] | undefined>(undefined);
    const [replies, setReplies] = useState<Reply[] | undefined>(undefined)
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchPostsReposts = async () => {
            const postsPromise = fetch(`/api/posts/posts/${user.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const repostsPromise = fetch(`/api/posts/reposts/${user.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

            const posts: Post[] = await postsResponse.json();
            const reposts: Repost[] = await repostsResponse.json();

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
    }, [user]);

    useEffect(() => {
        if (activeTab === 1 && replies === undefined) {
            const fetchReplies = async () => {
                const repliesResponse = await fetch(`/api/posts/replies/${user.username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const replies: Reply[] = await repliesResponse.json();

                setReplies(replies);
            }

            fetchReplies();
        }
    }, [user, activeTab, replies]);

    if (!postsReposts) return <div>loading...</div>

    if (activeTab === 0) {
        return (
            <div>
                <ProfileContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className='feed-hr-line'></div>

                <section className='feed-posts-desktop'>
                    {postsReposts.map((post, index) => {
                        return (
                            <div key={index}>
                                <ProfileContentPost post={post} />
                                <div className='feed-hr-line'></div>
                            </div>
                        )
                    })}
                </section>
            </div>
        )
    };

    console.log(replies);

    if (activeTab === 1) {
        if (!replies) return <div>loading...</div>

        return (
            <div>
                <ProfileContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className='feed-hr-line'></div>

                <section className='feed-posts-desktop'>
                    {replies.map((reply, index) => {
                        return (
                            <div key={index}>
                                <ProfileContentReply replyPost={reply} />
                                <div className='feed-hr-line'></div>
                            </div>
                        )
                    })}
                </section>
            </div>
        )
    };
}
