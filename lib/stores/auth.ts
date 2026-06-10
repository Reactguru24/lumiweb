import { create } from 'zustand'
import type { User, UserRole } from '@/lib/types'
import { authApi } from '@/lib/api/services'

interface AuthState {
  user: Omit<User, 'password'> | null
  loading: boolean
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
  clearSession: () => void
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean
  getDashboardRoute: () => string
  getAccessibleRoutes: () => string[]
  canAccessRoute: (requiredRoles: UserRole[]) => boolean
}

function deriveRole(user: Omit<User, 'password'> | null): UserRole | null {
  if (!user || user.disabled) return null
  return user.role ?? null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  role: null,
  isCustomer: false,
  isVendor: false,
  isAdmin: false,
  isDisabled: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { user: loggedIn } = await authApi.login(email, password)
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
      const { user: registered } = await authApi.register(data)
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
      await authApi.logout()
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

  refreshUser: () => {
    const currentUser = authApi.getCurrentUser()
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
      user: currentUser,
      isAuthenticated: !!currentUser,
      role,
      isCustomer: role === 'CUSTOMER',
      isVendor: role === 'VENDOR',
      isAdmin: role === 'ADMIN',
      isDisabled: currentUser?.disabled ?? false,
    })
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
    switch (get().role) {
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
      case 'VENDOR': return [...baseRoutes, '/account', '/vendor']
      case 'CUSTOMER': return [...baseRoutes, '/account']
      default: return baseRoutes
    }
  },

  canAccessRoute: (requiredRoles) => {
    const { isAuthenticated, role } = get()
    if (!isAuthenticated || !role) return false
    return requiredRoles.includes(role)
  },
}))
