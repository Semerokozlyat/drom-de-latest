import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
import CreateForm from "@/app/ui/reviews/create-form";

// this page is a Server Component, it fetches customers and passes them to form completely on the server side.
export default async function Page() {
    const authors = await fetchCustomers();

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Reviews', href: '/dashboard/reviews' },
                    {
                        label: 'Create Review',
                        href: '/dashboard/reviews/create',
                        active: true,
                    },
                ]}
            />
            <CreateForm authors={authors} />
        </main>
    );
}