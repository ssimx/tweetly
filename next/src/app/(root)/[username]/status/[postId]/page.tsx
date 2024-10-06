import React from 'react'

export default async function page({ params }: { params: { postId: string } }) {
    const response = await fetch(`/api/test/repost/${params.postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    console.log(response);
    
    return (
        <div>
            {params.postId}
        </div>
    )
}
