import { decryptSession, getToken } from "@/lib/session";
import { redirect } from "next/navigation";
import BookmarkedPost from "@/components/posts/BookmarkedPost";

export interface BookmarkedPostType {
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

interface BookmarkedPostResponseType {
    post: {
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
    }
};

export default async function Bookmarks() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const response = await fetch(`http://localhost:3000/api/posts/bookmarks/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const bookmarks = await response.json() as BookmarkedPostResponseType[];

    return (
        <section className='w-full h-fit'>
            <div className='feed-hr-line'></div>
            {bookmarks.map((item, index) => (
                <div key={index}>
                    <BookmarkedPost post={item.post} />
                    <div className='feed-hr-line'></div>
                </div>
            ))}
        </section>
    )
}
