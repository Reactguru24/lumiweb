import type { Router, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

/**
 * Security event logger for audit trail
 */
const logSecurityEvent = (event: string, details: Record<string, unknown>) => {
  const timestamp = new Date().toISOString()
  const logEntry = { timestamp, event, ...details }
  console.warn('[SECURITY]', logEntry)
  // In production, send to logging service
  // sendToLoggingService(logEntry)
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const auth = useAuthStore()
  return auth.isAuthenticated && !!auth.user && !auth.user.disabled
}

/**
 * Check if user has required role(s)
 */
export const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
  const auth = useAuthStore()
  if (!isAuthenticated()) return false

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(auth.role as UserRole)
}

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  return hasRole('ADMIN')
}

/**
 * Check if user is vendor
 */
export const isVendor = (): boolean => {
  return hasRole('VENDOR')
}

/**
 * Check if user is customer
 */
export const isCustomer = (): boolean => {
  return hasRole('CUSTOMER')
}

/**
 * Guard factory for role-based access
 */
export const createRoleGuard = (allowedRoles: UserRole[]) => {
  return (to: RouteLocationNormalized) => {
    if (!isAuthenticated()) {
      logSecurityEvent('UNAUTHENTICATED_ACCESS_ATTEMPT', {
        route: to.path,
        requiredRoles: allowedRoles,
      })
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (!hasRole(allowedRoles)) {
      const auth = useAuthStore()
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        route: to.path,
        userRole: auth.role,
        requiredRoles: allowedRoles,
        userId: auth.user?.id,
      })
      return { name: 'unauthorized' }
    }

    return true
  }
}

/**
 * Guard for guest-only routes (not authenticated users)
 */
export const guestGuard = (to: RouteLocationNormalized) => {
  const auth = useAuthStore()

  if (auth.isAuthenticated && auth.user && !auth.user.disabled) {
    // User is already authenticated, redirect to appropriate dashboard
    return { path: auth.getDashboardRoute() }
  }

  return true
}

/**
 * Guard for authenticated-only routes
 */
export const authGuard = (to: RouteLocationNormalized) => {
  if (!isAuthenticated()) {
    logSecurityEvent('PROTECTED_ROUTE_ACCESS_ATTEMPT', {
      route: to.path,
    })
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
}

/**
 * Guard for disabled users
 */
export const disabledUserGuard = (to: RouteLocationNormalized) => {
  const auth = useAuthStore()

  if (auth.user?.disabled) {
    logSecurityEvent('DISABLED_USER_ACCESS_ATTEMPT', {
      route: to.path,
      userId: auth.user.id,
    })
    auth.logout()
    return { name: 'login', query: { disabled: 'true' } }
  }

  return true
}

/**
 * Setup all route guards
 */
export const setupRouteGuards = (router: Router) => {
  router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()

    // Refresh user from storage
    auth.refreshUser()

    // Check if user is disabled
    const disabledCheck = disabledUserGuard(to)
    if (disabledCheck !== true) {
      return next(disabledCheck)
    }

    // Check guest routes
    const guestCheck = guestGuard(to)
    if (guestCheck !== true) {
      return next(guestCheck)
    }

    // Get all role requirements from matched routes
    const requiredRoles = to.matched
      .flatMap((r) => r.meta.roles as UserRole[] | undefined)
      .filter(Boolean) as UserRole[]

    // Check authentication
    if (to.meta.requiresAuth && !isAuthenticated()) {
      logSecurityEvent('UNAUTHENTICATED_ROUTE_ACCESS', {
        route: to.path,
        requiredRoles,
      })
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // Check role-based access
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      const auth = useAuthStore()
      logSecurityEvent('ROLE_BASED_ACCESS_DENIED', {
        route: to.path,
        userRole: auth.role,
        requiredRoles,
        userId: auth.user?.id,
      })
      return next({ name: 'unauthorized' })
    }

    next()
  })

  // After navigation hook for additional security checks
  router.afterEach((to) => {
    // Reset any sensitive data from previous routes
    if (!to.meta.requiresAuth) {
      // Could clear sensitive session data here if needed
    }
  })
}

/**
 * Helper to check if current user can access a route
 */
export const canAccessRoute = (requiredRoles: UserRole[]): boolean => {
  return isAuthenticated() && hasRole(requiredRoles)
}

/**
 * Helper to get accessible routes for current user
 */
export const getAccessibleRoutes = (): string[] => {
  const auth = useAuthStore()

  if (!isAuthenticated()) {
    return ['/', '/auth/login', '/auth/register', '/products', '/products/:id']
  }

  const baseRoutes = ['/', '/products', '/products/:id', '/cart', '/account/*']

  if (isAdmin()) {
    return [...baseRoutes, '/admin/*']
  }

  if (isVendor()) {
    return [...baseRoutes, '/vendor/*']
  }

  return baseRoutes
}
