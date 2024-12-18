import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/reviews/table';
import { lusitana } from '@/app/ui/fonts';
import { ReviewsTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import {fetchReviewsPages} from '@/app/lib/data';
import { Metadata } from 'next';
import {CreateReview, MyReviews} from "@/app/ui/reviews/buttons";

export const metadata: Metadata = {
    title: 'Owner Reviews',
}

export default async function Page(
    props: {
        searchParams?: Promise<{query?: string; page?: string;}>
    }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    const totalPages = await fetchReviewsPages(query);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Owner reviews</h1>
            </div>
            <div className="mt-4 flex items-center justify-left gap-2 md:mt-8">
                <MyReviews />
                <CreateReview />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search for owner reviews..." />
            </div>
            <Suspense key={query + currentPage} fallback={<ReviewsTableSkeleton />}>
                <Table query={query} currentPage={currentPage} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}