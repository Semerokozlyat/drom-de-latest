import { fetchFilteredReviews } from 'app/lib/data';
import Image from "next/image";
import ReviewStatus from "@/app/ui/reviews/status";
import { formatDateToLocal } from "@/app/lib/utils";
import {DeleteReview, ObserveReview, UpdateReview} from "@/app/ui/reviews/buttons";

export default async function ReviewsTable(
    {query, currentPage}: {
        query: string;
        currentPage: number;
    }) {
    const reviews = await fetchFilteredReviews(query, currentPage);

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                        {reviews?.map((review) => (
                            <div
                                key={review.id}
                                className="mb-2 w-full rounded-md bg-white p-4"
                            >
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <Image
                                                src={review.image_url}
                                                className="mr-2 rounded-full"
                                                width={28}
                                                height={28}
                                                alt={`${review.author_name} author profile image`}
                                            />
                                            <p>{review.author_name}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">{review.customer_id}</p>
                                    </div>
                                    <ReviewStatus status={review.status} />
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p>{formatDateToLocal(review.created_at)}</p>
                                        <p>{formatDateToLocal(review.updated_at)}</p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <UpdateReview id={review.id} />
                                        <DeleteReview id={review.id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                        <tr>
                            <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                Author
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Title
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Updated At
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Status
                            </th>
                            <th scope="col" className="relative py-3 pl-6 pr-3">
                                <span className="sr-only">Edit</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white">
                        {reviews?.map((review) => (
                            <tr
                                key={review.id}
                                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                            >
                                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={review.image_url}
                                            className="rounded-full"
                                            width={28}
                                            height={28}
                                            alt={`${review.author_name}'s profile picture`}
                                        />
                                        <p>{review.author_name}</p>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    {review.title}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    {formatDateToLocal(review.updated_at)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    <ReviewStatus status={review.status} />
                                </td>
                                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                    <div className="flex justify-end gap-3">
                                        <ObserveReview id={review.id} />
                                        <DeleteReview id={review.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}