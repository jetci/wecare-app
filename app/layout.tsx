import './globals.css'
import Providers from './Providers'  // Client-only header and other providers
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
            {children}
          </AuthProvider>
        </Providers>
        
      </body>
    </html>
  )
}


