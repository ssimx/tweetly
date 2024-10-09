'server only';
import NewPost from '@/components/NewPost';
import PostInfo from '@/components/PostInfo';
import PostReplies from '@/components/PostReplies';
import ReplyInfo from '@/components/ReplyInfo';
import { getToken } from '@/lib/session';
import { PostInfoType } from '@/lib/types';

export default async function Status({ params }: { params: { postId: string } }) {
    let parentPostInfo;
    const token = getToken();

    const postResponse = await fetch(`http://localhost:3000/api/posts/status/${params.postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });
    const postInfo = await postResponse.json() as PostInfoType;

    console.log(postInfo);
    

    if (postInfo.replyToId) {
        const parentPostResponse = await fetch(`http://localhost:3000/api/posts/status/${postInfo.replyToId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        parentPostInfo = await parentPostResponse.json() as PostInfoType;
    }

    const repliesResponse = await fetch(`http://localhost:3000/api/posts/replies/${params.postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });
    const replies = await repliesResponse.json() as PostInfoType[];

    if (!postInfo) return <div>loading...</div>

    return (
        <section>
            <div>
                {
                    parentPostInfo
                        ? <ReplyInfo replyPost={postInfo} parentPost={parentPostInfo} />
                        : <PostInfo post={postInfo} />
                }
                <div className='reply'>
                    <NewPost placeholder='Post your reply' reply={postInfo.id} />
                </div>
            </div>

            <PostReplies replies={replies} />
        </section>
    )
}
