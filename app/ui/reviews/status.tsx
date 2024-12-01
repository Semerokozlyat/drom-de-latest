import {CheckIcon, ClockIcon, DocumentIcon} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function ReviewStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-400': status === 'pending',
          'bg-green-500 text-white': status === 'published',
          'bg-gray-100 text-gray-500': status === 'archived',
        },
      )}
    >
      {status === 'pending' ? (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-400" />
        </>
      ) : null}
      {status === 'published' ? (
        <>
          Published
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {status === 'archived' ? (
        <>
          Archived
          <DocumentIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
    </span>
  );
}
