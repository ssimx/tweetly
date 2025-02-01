'server only';
import NewPost from '@/components/feed/NewPost';
import PostInfo from '@/components/posts/PostInfo';
import PostReplies from '@/components/posts/post-replies/Replies';
import ReplyInfo from '@/components/posts/ReplyInfo';
import { getToken } from '@/lib/session';
import { getPostInfo } from '@/data-acess-layer/user-dto';

export interface RepliesType {
    posts: PostType[],
    end: boolean,
};

export default async function Status(props: { params: Promise<{ postId: number }> }) {
    const params = await props.params;
    const post = await getPostInfo(params.postId);
    if (!post) return <div>Post doesn&apos;t exist</div>

    console.log(post);

    return (
        <section>
            <div>
                {
                    post.replyTo !== null
                        ? <ReplyInfo replyPost={post} parentPost={post.replyTo} />
                        : <PostInfo post={post} />
                }
                <div className='reply'>
                    <NewPost placeholder='Post your reply' reply={post.id} />
                </div>
            </div>

            <PostReplies replies={post.replies} repliesEnd={post.repliesEnd} />
        </section>
    )
}
