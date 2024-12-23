import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {fetchCustomers, fetchReviewByID} from '@/app/lib/data';
import EditForm from "@/app/ui/reviews/edit-form";
import {notFound} from "next/navigation";

// this page is a Server Component, it fetches customers and passes them to form completely on the server side.
export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const id = params.id;
    const [review, authors] = await Promise.all([
        fetchReviewByID(id),
        fetchCustomers(),
    ]);

    if (!review) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Reviews', href: '/dashboard/reviews' },
                    {
                        label: 'Edit Review',
                        href: `/dashboard/reviews/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <EditForm review={review} authors={authors} />
        </main>
    );
}