import Image from 'next/image';
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';

export default function PostImages({ images }: { images: string[] | undefined }) {
    if (!images) return <div></div>;

    return (
        <PhotoProvider>
            {images.length === 1
                ? (
                    <div className="mt-2 relative inline-block w-fit max-h-[500px]">
                        <PhotoView key={0} src={images[0]}>
                            <Image 
                                src={images[0]} 
                                alt="Selected preview" 
                                className="max-h-[500px] w-auto object-contain rounded-md hover:cursor-pointer" 
                                width={400} height={400}
                                onClick={(e) => e.stopPropagation()} />
                        </PhotoView>
                    </div>
                )
                : (images.length > 1 && images.length < 5)
                    ? (
                        <div className={`mt-2 grid gap-1 w-full h-[300px] ${images.length === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2'}`}>
                            {images.map((image, index) => (
                                <div key={index} className='h-full relative'>
                                    <PhotoView key={index} src={image}>
                                        <Image 
                                            src={image} 
                                            alt="Selected preview" 
                                            className="h-full w-full object-cover rounded-md hover:cursor-pointer" 
                                            width={400} height={400} 
                                            onClick={(e) => e.stopPropagation()} />
                                    </PhotoView>
                                </div>
                            ))}
                        </div>
                    )
                    : null
            }
        </PhotoProvider>
    );
}
