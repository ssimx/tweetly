'use client';
import React from 'react';
import Image from 'next/image';
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { BasicPostType } from '@/lib/types';
import Link from 'next/link';

export default function ProfileMedia({ post }: { post: BasicPostType }) {

    if (post.images === undefined || post.images.length === 0) return <></>;
    return (
        <PhotoProvider key={post.id}>
            <PhotoView key={0} src={post.images[0]}>
                <Link href={`http://localhost:3000/${post.author.username}/status/${post.id}/photo/1`} >
                    <Image
                        src={post.images[0]}
                        alt="Selected preview"
                        className="max-h-[500px] w-auto object-contain rounded-md hover:cursor-pointer"
                        width={1000} height={1000}
                        onClick={e => e.preventDefault()} />
                </Link>
            </PhotoView>
        </PhotoProvider>
    )
}
