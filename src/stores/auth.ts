import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'
import { authApi } from '@/api/services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Omit<User, 'password'> | null>(authApi.getCurrentUser())
  const loading = ref(false)

  // Computed properties for auth state
  const isAuthenticated = computed(() => {
    return !!user.value && !user.value.disabled
  })

  const role = computed<UserRole | null>(() => {
    if (!user.value || user.value.disabled) return null
    return user.value.role ?? null
  })

  const isCustomer = computed(() => role.value === 'CUSTOMER')
  const isVendor = computed(() => role.value === 'VENDOR')
  const isAdmin = computed(() => role.value === 'ADMIN')

  /**
   * Check if user has a specific role
   */
  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!isAuthenticated.value) return false
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(role.value as UserRole)
  }

  /**
   * Check if user account is disabled
   */
  const isDisabled = computed(() => user.value?.disabled ?? false)

  /**
   * Login user
   */
  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { user: loggedIn } = await authApi.login(email, password)
      if (loggedIn.disabled) {
        throw new Error('Account has been disabled')
      }
      user.value = loggedIn
      return loggedIn
    } catch (error) {
      user.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Register user
   */
  async function register(data: { fullName: string; email: string; phone: string; password: string }) {
    loading.value = true
    try {
      const { user: registered } = await authApi.register(data)
      if (registered.disabled) {
        throw new Error('Account registration failed')
      }
      user.value = registered
      return registered
    } catch (error) {
      user.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logout() {
    loading.value = true
    try {
      await authApi.logout()
    } finally {
      user.value = null
      loading.value = false
    }
  }

  /**
   * Refresh user from storage (on page reload)
   */
  function refreshUser() {
    const currentUser = authApi.getCurrentUser()
    if (currentUser?.disabled) {
      // Automatically logout disabled users
      user.value = null
      return
    }
    user.value = currentUser
  }

  /**
   * Clear user session
   */
  function clearSession() {
    user.value = null
  }

  /**
   * Get appropriate dashboard route based on user role
   */
  function getDashboardRoute(): string {
    switch (role.value) {
      case 'ADMIN':
        return '/admin'
      case 'VENDOR':
        return '/vendor'
      case 'CUSTOMER':
        return '/account'
      default:
        return '/'
    }
  }

  /**
   * Get accessible routes for current user
   */
  function getAccessibleRoutes(): string[] {
    if (!isAuthenticated.value) {
      return ['/', '/auth/login', '/auth/register', '/products']
    }

    const baseRoutes = ['/', '/products', '/cart']

    switch (role.value) {
      case 'ADMIN':
        return [...baseRoutes, '/admin']
      case 'VENDOR':
        return [...baseRoutes, '/account', '/vendor']
      case 'CUSTOMER':
        return [...baseRoutes, '/account']
      default:
        return baseRoutes
    }
  }

  /**
   * Check if user can access specific route
   */
  function canAccessRoute(requiredRoles: UserRole[]): boolean {
    if (!isAuthenticated.value) return false
    if (!role.value) return false
    return requiredRoles.includes(role.value)
  }

  return {
    // State
    user,
    loading,
    // Computed state
    isAuthenticated,
    role,
    isCustomer,
    isVendor,
    isAdmin,
    isDisabled,
    // Methods
    login,
    register,
    logout,
    refreshUser,
    clearSession,
    hasRole,
    getDashboardRoute,
    getAccessibleRoutes,
    canAccessRoute,
  }
})

