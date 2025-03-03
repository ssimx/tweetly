'use client';
import React from 'react';
import Image from 'next/image';
import 'react-photo-view/dist/react-photo-view.css';
import { useRouter } from 'next/navigation';
import { BasePostDataType } from 'tweetly-shared';

export default function ProfileMediaPost({ post }: { post: BasePostDataType }) {
    const router = useRouter();

    const openPhoto = () => {
        router.push(`http://localhost:3000/${post.author.username}/status/${post.id}/photo/1`, { scroll: false });
    };

    if (post.images === undefined || post.images.length === 0) return <></>;

    return (
        <Image
            src={post.images[0]}
            alt="Post image preview"
            className="h-[250px] w-[250px] object-cover rounded-md hover:cursor-pointer"
            width={400} height={400}
            onClick={openPhoto} />
    )
}
