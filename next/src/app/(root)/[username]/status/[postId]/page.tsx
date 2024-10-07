import { PostInfoType } from '@/lib/types'
import React from 'react'

export default async function Status({ params }: { params: { postId: string } }) {
    const response = await fetch(`http://localhost:3000/api/posts/status/${params.postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const postInfo = await response.json() as PostInfoType;
    console.log(postInfo);
    
    if (!postInfo) return <div>loading...</div>

    return (
        <div>
            {postInfo.id}
        </div>
    )
}
