import {PencilIcon, PlusIcon, TrashIcon, DocumentTextIcon, ArrowRightCircleIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteReview } from '@/app/lib/actions';

export function MyReviews() {
  return (
      <Link
          href="/dashboard/reviews/my"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span className="hidden md:block">My Reviews</span>{' '}
        <ArrowRightCircleIcon className="h-5 md:ml-4" />
      </Link>
  );
}

export function CreateReview() {
  return (
    <Link
      href="/dashboard/reviews/create"
      className="flex h-10 items-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
    >
      <span className="hidden md:block">Post Review</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function ObserveReview({ id }: { id: string }) {
  return (
      <Link
          href={`/dashboard/reviews/${id}`}
          className="rounded-md border p-2 hover:bg-gray-100"
      >
        <DocumentTextIcon className="w-5" />
      </Link>
  );
}

export function UpdateReview({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/reviews/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteReview({ id }: { id: string }) {
  // Explanation: review.id cannot be sent as argument to the Server Action directly,
  // need to use JS 'bind' that ensures all values are encoded.
  const deleteReviewWithId = deleteReview.bind(null, id);

  return (
    <form action={deleteReviewWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
