import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

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
          <Toaster position="bottom-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
