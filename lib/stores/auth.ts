import { create } from 'zustand'
import type { User, UserRole } from '@/lib/types'
import { authData } from '@/lib/data/services'

interface AuthState {
  user: Omit<User, 'password'> | null
  loading: boolean
  hasHydrated: boolean
  isAuthenticated: boolean
  role: UserRole | null
  isCustomer: boolean
  isVendor: boolean
  isAdmin: boolean
  isDisabled: boolean
  login: (email: string, password: string) => Promise<Omit<User, 'password'>>
  register: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<Omit<User, 'password'>>
  logout: () => Promise<void>
  refreshUser: () => void
  setHasHydrated: (value: boolean) => void
  clearSession: () => void
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean
  getDashboardRoute: () => string
  getAccessibleRoutes: () => string[]
  canAccessRoute: (requiredRoles: UserRole[]) => boolean
}

function deriveRole(user: Omit<User, 'password'> | null): UserRole | null {
  if (!user || user.disabled) return null
  const role = user.role ?? null
  // Ensure only valid roles are returned
  if (role && !['CUSTOMER', 'VENDOR', 'ADMIN'].includes(role)) {
    return null
  }
  return role
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  hasHydrated: false,
  isAuthenticated: false,
  role: null,
  isCustomer: false,
  isVendor: false,
  isAdmin: false,
  isDisabled: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required')
      }
      const { user: loggedIn } = await authData.login(email, password)
      if (!loggedIn) throw new Error('Login failed - no user data')
      if (loggedIn.disabled) throw new Error('Account has been disabled')
      const role = deriveRole(loggedIn)
      set({
        user: loggedIn,
        isAuthenticated: true,
        role,
        isCustomer: role === 'CUSTOMER',
        isVendor: role === 'VENDOR',
        isAdmin: role === 'ADMIN',
        isDisabled: false,
      })
      return loggedIn
    } catch (error) {
      set({ user: null, isAuthenticated: false, role: null, isCustomer: false, isVendor: false, isAdmin: false })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  register: async (data) => {
    set({ loading: true })
    try {
      if (!data?.fullName?.trim() || !data?.email?.trim() || !data?.password?.trim()) {
        throw new Error('All fields are required')
      }
      const { user: registered } = await authData.register(data)
      if (!registered) throw new Error('Registration failed - no user data')
      if (registered.disabled) throw new Error('Account registration failed')
      const role = deriveRole(registered)
      set({
        user: registered,
        isAuthenticated: true,
        role,
        isCustomer: role === 'CUSTOMER',
        isVendor: role === 'VENDOR',
        isAdmin: role === 'ADMIN',
        isDisabled: false,
      })
      return registered
    } catch (error) {
      set({ user: null, isAuthenticated: false, role: null, isCustomer: false, isVendor: false, isAdmin: false })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    set({ loading: true })
    try {
      await authData.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({
        user: null,
        loading: false,
        isAuthenticated: false,
        role: null,
        isCustomer: false,
        isVendor: false,
        isAdmin: false,
        isDisabled: false,
      })
    }
  },

  setHasHydrated: (value) => set({ hasHydrated: value }),

  refreshUser: () => {
    try {
      const currentUser = authData.getCurrentUser()
      const state = get()

      if (currentUser?.disabled) {
        if (state.isAuthenticated || state.user) {
          set({ user: null, isAuthenticated: false, role: null, isCustomer: false, isVendor: false, isAdmin: false })
        }
        return
      }

      const role = deriveRole(currentUser)
      const userId = currentUser?.id ?? null
      const stateUserId = state.user?.id ?? null

      if (
        userId === stateUserId &&
        !!currentUser === state.isAuthenticated &&
        role === state.role &&
        (currentUser?.disabled ?? false) === state.isDisabled
      ) {
        return
      }

      set({
        user: currentUser ?? null,
        isAuthenticated: !!currentUser,
        role,
        isCustomer: role === 'CUSTOMER',
        isVendor: role === 'VENDOR',
        isAdmin: role === 'ADMIN',
        isDisabled: currentUser?.disabled ?? false,
      })
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // On error, keep current state to prevent flash of logout
    }
  },

  clearSession: () => {
    set({ user: null, isAuthenticated: false, role: null, isCustomer: false, isVendor: false, isAdmin: false })
  },

  hasRole: (requiredRole) => {
    const { isAuthenticated, role } = get()
    if (!isAuthenticated || !role) return false
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(role)
  },

  getDashboardRoute: () => {
    const currentRole = get().role
    switch (currentRole) {
      case 'ADMIN': return '/admin'
      case 'VENDOR': return '/vendor'
      case 'CUSTOMER': return '/'
      default: return '/'
    }
  },

  getAccessibleRoutes: () => {
    const { isAuthenticated, role } = get()
    if (!isAuthenticated) return ['/', '/auth/login', '/auth/register', '/products']
    const baseRoutes = ['/', '/products', '/cart']
    switch (role) {
      case 'ADMIN': return [...baseRoutes, '/admin']
      case 'VENDOR': return [...baseRoutes, '/vendor']
      case 'CUSTOMER': return [...baseRoutes, '/account']
      default: return baseRoutes
    }
  },

  canAccessRoute: (requiredRoles) => {
    const { isAuthenticated, role } = get()
    if (!isAuthenticated || !role) return false
    return Array.isArray(requiredRoles) ? requiredRoles.includes(role) : requiredRoles === role
  },
}))
