import React from 'react'

export default function page({ params }: { params: { username: string } }) {
    return (
        <div>
            {params.username}
        </div>
    )
}
