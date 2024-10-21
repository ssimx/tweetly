
import { decryptSession, getToken } from "@/lib/session";
import { redirect } from "next/navigation";
import NotificationPost from "@/components/notifications/NotificationPost";
import NotificationFollow from "@/components/notifications/NotificationFollow";

interface NotificationType {
    id: number;
    type: {
        name: string;
        description: string;
    };
    isRead: boolean,
    notifier: {
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
    };
    post: {
        id: number;
        content: string;
        createdAt: string;
        updatedAt: string;
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
        };
        replyTo: {
            id: number;
            content: string;
            createdAt: string;
            updatedAt: string;
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
            };
        } | null,
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
    } | null;
};

export interface NotificationPostType {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
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
    };
    replyTo: {
        id: number;
        content: string;
        createdAt: string;
        updatedAt: string;
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
        };
    } | null,
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


export default async function Notifications() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const response = await fetch(`http://localhost:3000/api/users/notifications/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });
    const notifications = await response.json() as NotificationType[];

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            {notifications.map((item, index) => (
                <div key={index}>
                    {
                        item.type.name !== 'FOLLOW'
                            ? (
                                <>
                                    <NotificationPost
                                        post={item.post as NotificationPostType}
                                        type={item.type}
                                        isRead={item.isRead}
                                        notifier={item.notifier} />
                                    <div className='feed-hr-line'></div>
                                </>
                            )
                            : (
                                <>
                                    <NotificationFollow isRead={item.isRead} notifier={item.notifier} />
                                    <div className='feed-hr-line'></div>
                                </>
                            )
                    }

                </div>
            ))}
        </section >
    )
}
