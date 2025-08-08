import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Providers from './Providers';

// This should be declared only ONCE.
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WeCare Application',
  description: 'WeCare System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <main>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
