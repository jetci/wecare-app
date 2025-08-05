import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ClientOnly } from '@/components/auth/ClientOnly';

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <ClientOnly>
              {children}
            </ClientOnly>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
