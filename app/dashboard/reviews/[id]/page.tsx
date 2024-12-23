import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {fetchReviewById, fetchCustomers, fetchImages} from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import {formatDateToLocal} from "@/app/lib/utils";
import ImageGallery from "@/app/ui/reviews/image_gallery";
import {ImagesTable} from "@/app/lib/definitions";

export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const id = params.id;
    const [review, customers, reviewImages] = await Promise.all([  // Promise.all here to fetch all data in parallel
        fetchReviewById(id),
        fetchCustomers(),
        fetchImages(id, "review"),
    ]);

    // // TODO: remove
    // const reviewImagesTest: ImagesTable[] = [
    //     {id: '1', document_id: id, document_type: 'review', url: '/customers/evil-rabbit.png'},
    //     {id: '2', document_id: id, document_type: 'review', url: '/customers/lee-robinson.png'},
    //     {id: '3', document_id: id, document_type: 'review', url: '/customers/amy-burns.png'},
    // ]

    // Return 404 and UI from the "not-found.tsx" file if invoice is not found in database.
    if (!review) {
        notFound();
    }
    return (
        <main className="flex h-full flex-col items-left justify-left gap-2">
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Reviews', href: '/dashboard/reviews' },
                    {
                        label: `${review.title}`,
                        href: `/dashboard/reviews/${id}`,
                        active: true,
                    },
                ]}
            />
            <h2 className="text-xl font-semibold">{review.title}</h2>
            <div className="flex items-center gap-3">
                <Image
                    src={review.image_url}
                    className="rounded-full"
                    width={28}
                    height={28}
                    alt={`${review.author_name}'s profile picture`}
                />
                <p>{review.author_name}</p>
                {formatDateToLocal(review.updated_at)}
            </div>
            <div className="flex items-center gap-3">
                <ImageGallery images={reviewImages}/>
            </div>
            <div className="flex items-center gap-3">
                <p>{review.text}</p>
            </div>
            <div className="flex items-center gap-3">
            <Link
                href="/dashboard/reviews"
                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
            >
                Go Back
            </Link>
            </div>
        </main>
    );
}