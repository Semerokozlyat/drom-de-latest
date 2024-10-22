import React from "react";
import { NavLinks } from '@/app/ui/nav_links';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        <NavLinks />
        <main>{children}</main>
      </body>
    </html>
  );
}
