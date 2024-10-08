'server only';
import NewPost from '@/components/NewPost';
import PostInfo from '@/components/PostInfo';
import PostReplies from '@/components/PostReplies';
import { PostInfoType } from '@/lib/types';

export default async function Status({ params }: { params: { postId: string } }) {
    const postResponse = await fetch(`http://localhost:3000/api/posts/status/${params.postId}`, 
        { cache: 'no-store' });

    const postInfo = await postResponse.json() as PostInfoType;

    console.log(postInfo);
    

    const repliesResponse = await fetch(`http://localhost:3000/api/posts/replies/${params.postId}`, 
        { cache: 'no-store' });

    const replies = await repliesResponse.json() as PostInfoType[];

    console.log(replies[0]);

    if (!postInfo) return <div>loading...</div>

    return (
        <section>
            <div>
                <PostInfo post={postInfo} key={postInfo.id} />
                <div className='reply'>
                    <NewPost placeholder='Post your reply' reply={postInfo.id} />
                </div>
            </div>

            <PostReplies replies={replies} />
        </section>
    )
}
