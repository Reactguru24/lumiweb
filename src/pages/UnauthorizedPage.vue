<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Error Icon -->
      <div class="mb-6">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full">
          <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7" />
          </svg>
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-2">403</h1>
      <p class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Access Denied</p>

      <!-- Error Message -->
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        You don't have permission to access this page. Your account role doesn't allow access to this resource.
      </p>

      <!-- Details -->
      <div v-if="userRole" class="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 text-left">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          <span class="font-semibold">Your Role:</span>
          <span class="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
            {{ roleLabel }}
          </span>
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <router-link
          :to="dashboardRoute"
          class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          Go to Dashboard
        </router-link>

        <router-link
          to="/"
          class="block w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          Back to Home
        </router-link>

        <button
          @click="logout"
          class="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold py-3 transition duration-200"
        >
          Logout
        </button>
      </div>

      <!-- Footer Info -->
      <p class="text-xs text-gray-500 dark:text-gray-500 mt-6">
        If you believe this is an error, please contact support.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const userRole = computed(() => auth.role)
const dashboardRoute = computed(() => auth.getDashboardRoute())

const roleLabel = computed(() => {
  switch (auth.role) {
    case 'ADMIN':
      return 'Administrator'
    case 'VENDOR':
      return 'Vendor/Seller'
    case 'CUSTOMER':
      return 'Customer'
    default:
      return 'Unknown'
  }
})

const logout = async () => {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>
