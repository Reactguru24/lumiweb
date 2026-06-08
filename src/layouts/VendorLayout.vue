<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HomeIcon, CubeIcon, ShoppingCartIcon, ArchiveBoxIcon, ChartBarIcon,
  ChatBubbleLeftRightIcon, UserCircleIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import AppLogo from '@/components/common/AppLogo.vue'
import AppearanceControls from '@/components/common/AppearanceControls.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(false)

const navItems = [
  { name: 'Dashboard', to: '/vendor', icon: HomeIcon },
  { name: 'Products', to: '/vendor/products', icon: CubeIcon },
  { name: 'Orders', to: '/vendor/orders', icon: ShoppingCartIcon },
  { name: 'Inventory', to: '/vendor/inventory', icon: ArchiveBoxIcon },
  { name: 'Analytics', to: '/vendor/analytics', icon: ChartBarIcon },
  { name: 'Reviews', to: '/vendor/reviews', icon: ChatBubbleLeftRightIcon },
  { name: 'Store Profile', to: '/vendor/profile', icon: UserCircleIcon },
]

async function logout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform lg:translate-x-0 lg:static"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <AppLogo size="sm" />
        <button class="lg:hidden" @click="sidebarOpen = false"><XMarkIcon class="w-5 h-5" /></button>
      </div>
      <div class="p-4">
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-4">Seller Center</p>
        <nav class="space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors"
            :class="route.path === item.to ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
            @click="sidebarOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.name }}
          </router-link>
        </nav>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <button class="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 w-full" @click="logout">
          <ArrowLeftOnRectangleIcon class="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false" />

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button class="lg:hidden p-2 shrink-0" @click="sidebarOpen = true"><Bars3Icon class="w-6 h-6" /></button>
        <h1 class="text-sm sm:text-lg font-semibold hidden lg:block truncate">Vendor Dashboard</h1>
        <div class="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          <AppearanceControls />
          <span class="text-xs sm:text-sm text-gray-500 max-w-[8rem] sm:max-w-none truncate hidden sm:inline">{{ auth.user?.fullName }}</span>
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
