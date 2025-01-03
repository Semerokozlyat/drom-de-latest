'use client';

import { CustomerField } from 'app/lib/definitions';
import Link from 'next/link';
import { useActionState } from 'react';
import {
  ArchiveBoxArrowDownIcon,
  CheckIcon,
  ClockIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from 'app/ui/button';
import {createReview, CreateReviewState} from '@/app/lib/actions';

export default function CreateForm({ authors }: { authors: CustomerField[] }) {

  const initialState: CreateReviewState = { message: null, errors: {} }
  // Returns two values: [state, formAction] - the form state, and a function to be called when the form is submitted.
  const [state, formAction] = useActionState(createReview, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Author Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Author
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="author-error"  // establishes a relationship between the select element and the error message container. It indicates that the container with id="author-error" describes the select element.
            >
              <option value="" disabled>
                Select an Author
              </option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="author-error" aria-live="polite" aria-atomic="true">
            {state.errors?.customerId &&
                state.errors.customerId.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                ))}
          </div>
        </div>

        {/* Review title */}
        <div className="mb-4">
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Title
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="title"
                name="title"
                type="text"
                maxLength={255}
                placeholder="Enter the title"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <DocumentTextIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Review Text */}
        <div className="mb-4">
          <label htmlFor="text" className="mb-2 block text-sm font-medium">
            Your Review
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <textarea
                  id="text"
                  name="text"
                  maxLength={1024 * 50}
                  placeholder="Enter text"
                  className="peer block w-full h-52 rounded-md border border-gray-200 p-2 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Review Photos */}
        <div className="mb-4">
          <label htmlFor="images" className="mb-2 block text-sm font-medium">
            Your Photos
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                  id="images"
                  name="images"
                  type="file"
                  placeholder="Upload images"
                  className="peer block rounded-md border border-gray-200 p-2 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Review Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Choose Review status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="published"
                  name="status"
                  type="radio"
                  value="published"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="published"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Published <CheckIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                    id="archived"
                    name="status"
                    type="radio"
                    value="archived"
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                    htmlFor="archived"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Archived <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/reviews"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Send</Button>
      </div>
    </form>
  );
}
