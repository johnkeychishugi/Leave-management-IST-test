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
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    },
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