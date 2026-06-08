<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HomeIcon, UsersIcon, BuildingStorefrontIcon, CubeIcon, ShoppingCartIcon,
  Cog6ToothIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import AppLogo from '@/components/common/AppLogo.vue'
import AppearanceControls from '@/components/common/AppearanceControls.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(false)

const navItems = [
  { name: 'Dashboard', to: '/admin', icon: HomeIcon },
  { name: 'Users', to: '/admin/users', icon: UsersIcon },
  { name: 'Vendors', to: '/admin/vendors', icon: BuildingStorefrontIcon },
  { name: 'Products', to: '/admin/products', icon: CubeIcon },
  { name: 'Orders', to: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Settings', to: '/admin/settings', icon: Cog6ToothIcon },
]

async function logout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950">
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform lg:translate-x-0 lg:static"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-800">
        <span class="font-display text-xl font-bold tracking-tight text-white">LumiAfrica Admin</span>
        <button class="lg:hidden text-white" @click="sidebarOpen = false"><XMarkIcon class="w-5 h-5" /></button>
      </div>
      <nav class="p-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors"
          :class="route.path === item.to ? 'bg-white text-gray-900' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </router-link>
      </nav>
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button class="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 w-full" @click="logout">
          <ArrowLeftOnRectangleIcon class="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button class="lg:hidden p-2" @click="sidebarOpen = true"><Bars3Icon class="w-6 h-6" /></button>
        <h1 class="text-lg font-semibold">Platform Administration</h1>
        <div class="flex items-center gap-3">
          <AppearanceControls />
          <span class="text-sm text-gray-500">{{ auth.user?.fullName }}</span>
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
