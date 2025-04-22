'use client'

import React from 'react'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../lib/context/AuthContext'
import { MsalProvider } from '../lib/msal/MsalProvider'
import { NotificationProvider } from '../lib/context/NotificationContext'
import { ConfirmProvider } from '../lib/context/ConfirmProvider'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data
      gcTime: 0, // Don't cache data
      refetchOnWindowFocus: true, // Refetch when window gets focus
      retry: 1
    },
    mutations: {
      networkMode: 'always'
    }
  },
})

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MsalProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <ConfirmProvider>
              {children}
            </ConfirmProvider>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MsalProvider>
  )
} 