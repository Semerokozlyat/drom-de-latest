import {
    ClockIcon,
    UserGroupIcon,
    InboxIcon, TruckIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from 'app/ui/fonts';
import { fetchReviewsCardData } from '@/app/lib/data';

const iconMap = {
  reviews: TruckIcon,
  authors: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  //const { numberOfInvoices, numberOfCustomers, totalPaidInvoices, totalPendingInvoices } = await fetchCardData();
  const { numberOfReviews, numberOfAuthors } = await fetchReviewsCardData();

  return (
    <>
      <Card title="Owner Reviews" value={numberOfReviews} type="reviews" />
      <Card
        title="Active Authors"
        value={numberOfAuthors}
        type="authors"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'reviews' | 'authors';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
