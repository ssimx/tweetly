'server only';
import VisitedPostInfo from '@/components/posts/VisitedPostInfo';
import { getPostInfo } from '@/data-acess-layer/user-dto';

export default async function Photo({ params }: { params: Promise<{ postId: number, photoId: number }> }) {
    const { postId, photoId } = await params;
    const post = await getPostInfo(postId);
    if (!post) return <div>Post doesn&apos;t exist</div>

    return (
        <div>
            <VisitedPostInfo post={post} photoId={photoId} />
        </div>
    )
}
