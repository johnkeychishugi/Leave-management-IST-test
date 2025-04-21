'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

// Pages that don't require authentication
const publicPages = ['/login', '/register', '/'];

// We can't use export const metadata with 'use client'
// So we define these values directly in the head element

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const isPublicPage = publicPages.includes(pathname);

      if (!token && !isPublicPage) {
        // Redirect to login if not logged in and trying to access protected page
        router.push('/login');
      } else if (token && isPublicPage) {
        // Redirect to dashboard if logged in and trying to access public page
        router.push('/dashboard');
      }
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <head>
        <title>IST Leave Management System</title>
        <meta name="description" content="A comprehensive leave management system for IST employees" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
} 