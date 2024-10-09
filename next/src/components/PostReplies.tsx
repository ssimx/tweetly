import { PostInfoType } from '@/lib/types';
import ReplyPost from './ReplyPost';

export default function PostReplies({ replies }: { replies: PostInfoType[] }) {
    console.log(replies);
    
    return (
        <div>
            { replies.map((reply) => (
                <div key={reply.id}>
                    <ReplyPost post={reply} />

                    <hr className='feed-hr-line' />
                </div>
            ))}
        </div>
    )
}
