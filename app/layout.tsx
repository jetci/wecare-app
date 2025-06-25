import './globals.css'
import ConditionalHeader from '@/components/layout/ConditionalHeader'
import Providers from './Providers'
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100">
        <Providers>
          <AuthProvider>
            <ConditionalHeader />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}


