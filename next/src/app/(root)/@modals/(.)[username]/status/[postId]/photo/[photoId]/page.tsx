'server only';
import PostInfoModal from '@/components/posts/PostInfoModal';
import { getPostInfo } from '@/data-acess-layer/user-dto';

export default async function Photo(props: { params: Promise<{ postId: number, photoId: number }> }) {
    const params = await props.params;
    const post = await getPostInfo(params.postId);
    if (!post) return <div>Post doesn&apos;t exist</div>

    return (
        <PostInfoModal post={post} photoId={params.photoId} />
    )
}
