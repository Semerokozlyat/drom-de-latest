import { TruckIcon } from '@heroicons/react/24/outline';
import { lusitana } from 'app/ui/fonts';

export default function SiteLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <TruckIcon className="h-12 w-12" />
      <p className="text-[44px]">Drom DE</p>
    </div>
  );
}
