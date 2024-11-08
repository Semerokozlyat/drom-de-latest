'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();  // current URL path
  const { replace } = useRouter();  // used to replace current URL path in browser address field.

  const handleSearch = useDebouncedCallback((term: string) => {
      console.log(`Searching... ${term}`);

      const params = new URLSearchParams(searchParams);
      params.set('page', '1');  // Reset pagination to page 1.
      if (term) {
          params.set('query', term);
      } else {
          params.delete('query');
      }
      // With "replace" and "use client" page is updated without reloading - client-side navigation
      replace(`${pathname}?${params.toString()}`);  // updates current browser URL path with new search params
  }, 300)  // 300ms is the debounce delay

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
            handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
