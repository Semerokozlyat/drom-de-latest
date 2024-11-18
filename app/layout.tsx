import React from "react";
import 'app/ui/global.css';
import { inter } from 'app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: '%s | Drom de dashboard',
        default: 'Drom de dashboard'
    },
    description: 'Web portal for auto reviews and private rentals',
    metadataBase: new URL('https://drom.de/about'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
