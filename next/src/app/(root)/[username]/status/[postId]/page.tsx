'server only';
import PostInfo from '@/components/posts/PostInfo';
import { getPostInfo } from '@/data-acess-layer/user-dto';

export default async function Status({ params }: { params: Promise<{ postId: number }> }) {
    const { postId } = await params;
    const post = await getPostInfo(postId);
    if (!post) return <div>Post doesn&apos;t exist</div>

    return (
        <div>
            <PostInfo post={post} parentPost={post.replyTo} />
        </div>
    )
}
