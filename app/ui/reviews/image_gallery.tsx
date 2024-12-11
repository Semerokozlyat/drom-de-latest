'use client';

import {useState} from "react";
import Image from "next/image";
import {ImagesTable} from "@/app/lib/definitions";


export default function ImageGallery({ images }: { images: ImagesTable[] }) {
    // State variables for managing zoomed images
    const [zoomedImage, setZoomedImage] = useState("");
    // Function to open and zoom an image
    const openZoomedImage = (imageURL: string) => {
        setZoomedImage(imageURL);
    };
    // Function to close zoomed image
    const closeZoomedImage = () => {
        setZoomedImage("");
    };

    return (
        <div
            style={{
                display: 'grid',
                gridGap: '8px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, auto))',
            }}
        >
            {images.map((img, index) => (
            <div style={{ position: 'relative', height: '200px' }} key={index} onClick={() => openZoomedImage(img.url)}>
                <Image
                    alt="Mountains"
                    src={img.url}
                    fill
                    sizes="(min-width: 404px) 50vw, 100vw"
                    layout="fill"
                    style={{
                        objectFit: 'cover', // cover, contain, none
                    }}
                />
            </div>
            ))}
            {zoomedImage && <div style={{ height: '200px' }} key={images[1].id} onClick={closeZoomedImage}>
                <Image
                    alt="Mountains"
                    src={zoomedImage}
                    fill
                    sizes="(min-width: 404px) 50vw, 100vw"
                    layout="fill"
                    style={{
                        objectFit: 'contain', // cover, contain, none
                    }}
                />
            </div>
            }
            {/* And more images in the grid... */}
        </div>


        // <div className="flex h-40 w-40">
        //     {/* Render all images */}
        //     {images.map((img, index) => (
        //         <div key={index} onClick={() => openZoomedImage(img.url)}>
        //             <Image width={128} height={128} src={img.url} alt="review image" layout="fill" objectFit="cover" />
        //         </div>
        //     ))}
        //     {/* Render the zoomed image */}
        //     {zoomedImage && (
        //         <div className="" onClick={closeZoomedImage}>
        //             <Image width={256} height={256} src={zoomedImage} alt="zoomed review image" layout="fill" objectFit="contain" />
        //         </div>
        //     )}
        // </div>
    );
}