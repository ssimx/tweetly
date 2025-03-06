'use client';
import Image from 'next/image';
import Link from 'next/link';
import 'react-photo-view/dist/react-photo-view.css';

type PostImagesType = {
    images?: string[],
    authorUsername: string,
    postId: number,
    openPhoto: (photoIndex: number, authorUsername: string, postId: number) => void
};

export default function PostImages({ images, authorUsername, postId, openPhoto }: PostImagesType) {
    if (!images) return <div></div>;

    return (
        <>
            {images.length === 1
                ? (
                    <Link
                        href={images[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (e.button === 0) {
                                e.preventDefault(); // Prevents default navigation
                                openPhoto(0, authorUsername, postId);
                            }
                        }}
                        onAuxClick={(e) => {
                            if (e.button === 1) {
                                e.preventDefault(); // Prevent default middle-click behavior
                                const newTabUrl = `http://localhost:3000/${authorUsername}/status/${postId}/photo/1`;
                                window.open(newTabUrl, '_blank'); // Opens in new tab
                            }
                        }}
                    >
                        <Image
                            src={images[0]}
                            alt="Selected preview"
                            className="max-h-[500px] w-fit mt-2 object-contain rounded-md hover:cursor-pointer"
                            width={400} height={400}
                        />
                    </Link>
                )
                : (images.length > 1 && images.length < 5)
                    ? (
                        <div className={`mt-2 grid gap-1 w-full h-[300px] ${images.length === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2'}`}>
                            {images.map((image, index) => (
                                <div key={index} className='h-full relative'>
                                    <Link
                                        href={image}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            if (e.button === 0 || e.button === 1) { // Left click
                                                e.preventDefault();
                                                openPhoto(index, authorUsername, postId);
                                            }
                                        }}
                                    >
                                        <Image
                                            src={image}
                                            alt="Selected preview"
                                            className="max-h-[500px] w-fit mt-2 object-contain rounded-md hover:cursor-pointer"
                                            width={400} height={400}
                                        />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )
                    : null
            }
        </>
    );
}
