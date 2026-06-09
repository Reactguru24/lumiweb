import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

/**
 * Composable for checking user permissions and roles in components
 * 
 * Usage:
 * const { isAdmin, can, canAccess } = usePermissions()
 * 
 * if (isAdmin.value) { ... }
 * if (can('VENDOR')) { ... }
 * if (canAccess('ADMIN', 'VENDOR')) { ... }
 */
export const usePermissions = () => {
  const auth = useAuthStore()

  // Role checks
  const isAuthenticated = computed(() => auth.isAuthenticated)
  const isAdmin = computed(() => auth.isAdmin)
  const isVendor = computed(() => auth.isVendor)
  const isCustomer = computed(() => auth.isCustomer)
  const isDisabled = computed(() => auth.isDisabled)
  const currentRole = computed(() => auth.role)

  /**
   * Check if user has a specific role
   * @param role - Single role or array of roles
   * @returns boolean
   */
  const can = (role: UserRole | UserRole[]): boolean => {
    return auth.hasRole(role)
  }

  /**
   * Check if user can access route(s) with given roles
   * @param roles - One or more roles that grant access
   * @returns boolean
   */
  const canAccess = (...roles: UserRole[]): boolean => {
    return auth.canAccessRoute(roles)
  }

  /**
   * Check if user is in any of the given roles
   * @param roles - Array of roles
   * @returns boolean
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => auth.hasRole(role))
  }

  /**
   * Check if user has all given roles
   * @param roles - Array of roles
   * @returns boolean
   */
  const hasAllRoles = (roles: UserRole[]): boolean => {
    return roles.every((role) => auth.hasRole(role))
  }

  /**
   * Get accessible routes for current user
   */
  const getAccessibleRoutes = () => auth.getAccessibleRoutes()

  /**
   * Get dashboard route based on user role
   */
  const getDashboardRoute = () => auth.getDashboardRoute()

  /**
   * Check if should show admin features
   */
  const shouldShowAdminFeatures = computed(() => isAdmin.value && isAuthenticated.value)

  /**
   * Check if should show vendor features
   */
  const shouldShowVendorFeatures = computed(() => isVendor.value && isAuthenticated.value)

  /**
   * Check if should show customer features
   */
  const shouldShowCustomerFeatures = computed(() => isCustomer.value && isAuthenticated.value)

  return {
    // State
    isAuthenticated,
    isAdmin,
    isVendor,
    isCustomer,
    isDisabled,
    currentRole,
    // Computed helpers
    shouldShowAdminFeatures,
    shouldShowVendorFeatures,
    shouldShowCustomerFeatures,
    // Methods
    can,
    canAccess,
    hasAnyRole,
    hasAllRoles,
    getAccessibleRoutes,
    getDashboardRoute,
  }
}
