'server only';
import NewPost from '@/components/feed/NewPost';
import PostInfo from '@/components/posts/PostInfo';
import PostReplies from '@/components/posts/post-replies/Replies';
import ReplyInfo from '@/components/posts/ReplyInfo';
import { getToken } from '@/lib/session';
import { PostType } from '@/lib/types';

export interface RepliesType {
    posts: PostType[],
    end: boolean,
};

export default async function Status({ params }: { params: { postId: string } }) {
    let parentPost;
    const token = await getToken();

    const postResponse = await fetch(`http://localhost:3000/api/posts/status/${params.postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });
    const post = await postResponse.json() as PostType;

    if (post.replyToId) {
        const parentPostResponse = await fetch(`http://localhost:3000/api/posts/status/${post.replyToId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        parentPost = await parentPostResponse.json() as PostType;
    }

    const repliesResponse = await fetch(`http://localhost:3000/api/posts/postReplies/${params.postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });
    const replies = await repliesResponse.json() as RepliesType;
    console.log(replies);

    if (!post) return <div>loading...</div>

    return (
        <section>
            <div>
                {
                    parentPost
                        ? <ReplyInfo replyPost={post} parentPost={parentPost} />
                        : <PostInfo post={post} />
                }
                <div className='reply'>
                    <NewPost placeholder='Post your reply' reply={post.id} />
                </div>
            </div>

            <PostReplies replies={replies} />
        </section>
    )
}
