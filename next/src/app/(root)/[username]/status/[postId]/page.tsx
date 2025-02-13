'server only';
import { getPostInfo } from '@/data-acess-layer/user-dto';
import { VisitedPostType } from '@/lib/types';
import VisitedPostInfo from '@/components/posts/VisitedPostInfo';

export default async function Status({ params }: { params: Promise<{ postId: number }> }) {
    const { postId } = await params;
    const post = await getPostInfo(postId);
    if (!post) return <div>Post doesn&apos;t exist</div>

    return (
        <div>
            <VisitedPostInfo post={post as VisitedPostType} />
        </div>
    )
}
