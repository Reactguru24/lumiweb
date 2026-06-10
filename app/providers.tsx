'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { getDatabase } from '@/lib/api/database'
import { useAuthStore } from '@/lib/stores/auth'
import { useCartStore } from '@/lib/stores/cart'
import { useThemeStore } from '@/lib/stores/theme'
import { useCurrencyStore } from '@/lib/stores/currency'

function StoreHydration() {
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const hydrateCart = useCartStore((s) => s.hydrate)
  const hydrateTheme = useThemeStore((s) => s.hydrate)
  const hydrateCurrency = useCurrencyStore((s) => s.hydrate)

  useEffect(() => {
    getDatabase()
    refreshUser()
    hydrateCart()
    hydrateTheme()
    hydrateCurrency()
  }, [refreshUser, hydrateCart, hydrateTheme, hydrateCurrency])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <StoreHydration />
      {children}
      <Toaster position="top-right" richColors closeButton duration={3000} />
    </QueryClientProvider>
  )
}
