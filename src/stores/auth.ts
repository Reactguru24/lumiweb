import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'
import { authApi } from '@/api/services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Omit<User, 'password'> | null>(authApi.getCurrentUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const role = computed<UserRole | null>(() => user.value?.role ?? null)
  const isCustomer = computed(() => role.value === 'CUSTOMER')
  const isVendor = computed(() => role.value === 'VENDOR')
  const isAdmin = computed(() => role.value === 'ADMIN')

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { user: loggedIn } = await authApi.login(email, password)
      user.value = loggedIn
      return loggedIn
    } finally {
      loading.value = false
    }
  }

  async function register(data: { fullName: string; email: string; phone: string; password: string }) {
    loading.value = true
    try {
      const { user: registered } = await authApi.register(data)
      user.value = registered
      return registered
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    user.value = null
  }

  function refreshUser() {
    user.value = authApi.getCurrentUser()
  }

  function getDashboardRoute(): string {
    switch (role.value) {
      case 'ADMIN': return '/admin'
      case 'VENDOR': return '/vendor'
      default: return '/account'
    }
  }

  return {
    user, loading, isAuthenticated, role, isCustomer, isVendor, isAdmin,
    login, register, logout, refreshUser, getDashboardRoute,
  }
})
