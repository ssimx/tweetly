import Image from 'next/image';
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
                    <Image
                        src={images[0]}
                        alt="Selected preview"
                        className="max-h-[500px] w-fit mt-2 object-contain rounded-md hover:cursor-pointer"
                        width={400} height={400}
                        onClick={() => openPhoto(0, authorUsername, postId)} />
                )
                : (images.length > 1 && images.length < 5)
                    ? (
                        <div className={`mt-2 grid gap-1 w-full h-[300px] ${images.length === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2'}`}>
                            {images.map((image, index) => (
                                <div key={index} className='h-full relative'>
                                    <Image
                                        src={image}
                                        alt="Selected preview"
                                        className="h-full w-full object-cover rounded-md hover:cursor-pointer"
                                        width={400} height={400}
                                        onClick={() => openPhoto(index, authorUsername, postId)} />
                                </div>
                            ))}
                        </div>
                    )
                    : null
            }
        </>
    );
}
