import { PostType } from '@/lib/types';
import ReplyPost from './Reply';

export default function PostReplies({ replies }: { replies: PostType[] }) {

    return (
        <div>
            {replies.map((reply) => (
                <div key={reply.id}>
                    <ReplyPost post={reply} />

                    <hr className='feed-hr-line' />
                </div>
            ))}
        </div>
    )
}
