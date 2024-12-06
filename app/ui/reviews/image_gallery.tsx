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
        <div>
            {/* Render all images */}
            {images.map((img, index) => (
                <div key={index} onClick={() => openZoomedImage(img.url)}>
                    <Image src={img.url} alt="review image" layout="fill" objectFit="cover" />
                </div>
            ))}
            {/* Render the zoomed image */}
            {zoomedImage && (
                <div className="" onClick={closeZoomedImage}>
                    <Image src={zoomedImage} alt="zoomed review image" layout="fill" objectFit="contain" />
                </div>
            )}
        </div>
    );
}