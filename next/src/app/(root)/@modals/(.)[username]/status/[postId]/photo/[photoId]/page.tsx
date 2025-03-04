'server only';
import { getPostInfo } from '@/actions/get-actions';
import VisitedPostInfoModal from '@/components/posts/VisitedPostInfoModal';
import VisitedReplyInfoModal from '@/components/posts/VisitedReplyInfoModal';

export default async function Photo(props: { params: Promise<{ postId: number, photoId: number }> }) {
    const params = await props.params;
    const response = await getPostInfo(params.postId);
    if (!response.success || response.data?.post === undefined) return <div>Post doesn&apos;t exist</div>

    const { post } = response.data;

    if (post.replyTo !== undefined) {
        return (
            <div>
                <VisitedReplyInfoModal post={post} photoId={params.photoId} />
            </div>
        )
    }

    return (
        <div>
            <VisitedPostInfoModal post={post} photoId={params.photoId} />
        </div>
    )
}
