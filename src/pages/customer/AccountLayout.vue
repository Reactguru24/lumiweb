<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const links = [
  { to: '/account', label: 'Profile' },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/wishlist', label: 'Wishlist' },
  { to: '/account/vendor-application', label: 'Become a Vendor' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="section-title mb-8">My Account</h1>
    <div class="flex flex-col md:flex-row gap-8">
      <nav class="md:w-48 shrink-0 flex md:flex-col gap-1 overflow-x-auto">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-colors"
          :class="route.path === link.to ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'"
        >{{ link.label }}</router-link>
      </nav>
      <div class="flex-1">
        <router-view />
      </div>
    </div>
  </div>
</template>
