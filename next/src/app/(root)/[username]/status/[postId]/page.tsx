'server only';
import VisitedPostInfo from '@/components/posts/VisitedPostInfo';
import VisitedReplyInfo from '@/components/posts/VisitedReplyInfo';
import { getPostInfo } from '@/actions/get-actions';

export default async function Status({ params }: { params: Promise<{ postId: number }> }) {
    const { postId } = await params;
    const response = await getPostInfo(postId);
    if (!response.success || response.data?.post === undefined) return <div>Post doesn&apos;t exist</div>

    const { post } = response.data;
    if (post.replyTo !== undefined) {
        return (
            <div>
                <VisitedReplyInfo post={post} />
            </div>
        )
    }

    return (
        <div>
            <VisitedPostInfo post={post} />
        </div>
    )
}
