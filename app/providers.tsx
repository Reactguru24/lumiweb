'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'sonner'
import { getDatabase } from '@/lib/data/database'
import { useAuthStore } from '@/lib/stores/auth'
import { useCartStore } from '@/lib/stores/cart'
import { useThemeStore } from '@/lib/stores/theme'
import { useCurrencyStore } from '@/lib/stores/currency'

function StoreHydration() {
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated)
  const hydrateCart = useCartStore((s) => s.hydrate)
  const hydrateTheme = useThemeStore((s) => s.hydrate)
  const hydrateCurrency = useCurrencyStore((s) => s.hydrate)

  useEffect(() => {
    try {
      getDatabase()
      refreshUser()
      hydrateCart()
      hydrateTheme()
      hydrateCurrency()
    } catch (error) {
      console.error('Failed to hydrate stores:', error)
    } finally {
      setHasHydrated(true)
    }
  }, [refreshUser, setHasHydrated, hydrateCart, hydrateTheme, hydrateCurrency])

  return null
}

function RoutePrefetch() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/auth/login')
    router.prefetch('/auth/register')
    router.prefetch('/products')
    router.prefetch('/cart')
  }, [router])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydration />
      <RoutePrefetch />
      {children}
      <Toaster position="top-right" richColors closeButton duration={3000} />
    </>
  )
}
