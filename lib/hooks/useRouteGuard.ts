'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import type { UserRole } from '@/lib/types'

interface RouteGuardOptions {
  requiresAuth?: boolean
  guest?: boolean
  roles?: UserRole[]
}

export function useRouteGuard({ requiresAuth, guest, roles }: RouteGuardOptions) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const logout = useAuthStore((s) => s.logout)
  const getDashboardRoute = useAuthStore((s) => s.getDashboardRoute)
  const canAccessRoute = useAuthStore((s) => s.canAccessRoute)
  const rolesKey = roles?.join(',') ?? ''

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (user?.disabled) {
      logout()
      router.replace('/auth/login?disabled=true')
      return
    }

    if (guest && isAuthenticated) {
      router.replace(getDashboardRoute())
      return
    }

    if (requiresAuth && !isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (rolesKey && !canAccessRoute(rolesKey.split(',') as UserRole[])) {
      router.replace('/unauthorized')
    }
  }, [user, isAuthenticated, guest, requiresAuth, rolesKey, router, logout, getDashboardRoute, canAccessRoute])
}
