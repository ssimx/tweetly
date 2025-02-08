import Image from 'next/image';
import 'react-photo-view/dist/react-photo-view.css';

export default function PostImages({ images, openPhoto }: { images: string[], openPhoto: (photoIndex: number) => void }) {
    if (!images) return <div></div>;

    return (
        <>
            {images.length === 1
                ? (
                    <Image
                        src={images[0]}
                        alt="Selected preview"
                        className="max-h-[500px] w-auto mt-2 object-contain rounded-md hover:cursor-pointer"
                        width={400} height={400}
                        onClick={() => openPhoto(0)} />
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
                                        onClick={() => openPhoto(index)} />
                                </div>
                            ))}
                        </div>
                    )
                    : null
            }
        </>
    );
}
