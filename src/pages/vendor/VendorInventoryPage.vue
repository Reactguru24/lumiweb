<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { vendorApi, analyticsApi } from '@/api/services'
import { formatCurrency } from '@/utils/storage'

const auth = useAuthStore()

const { data: vendor } = useQuery({
  queryKey: ['my-vendor', auth.user?.id],
  queryFn: () => vendorApi.getByUserId(auth.user!.id),
})

const { data: analytics, isLoading } = useQuery({
  queryKey: computed(() => ['vendor-analytics', vendor.value?.id]),
  queryFn: () => analyticsApi.getVendorAnalytics(vendor.value!.id),
  enabled: computed(() => !!vendor.value?.id),
})
</script>

<template>
  <div>
    <h1 class="text-xl sm:text-2xl font-semibold mb-6">Inventory Management</h1>

    <div v-if="isLoading" class="grid md:grid-cols-2 gap-4">
      <div v-for="i in 3" :key="i" class="skeleton h-40" />
    </div>

    <div v-else-if="analytics" class="grid md:grid-cols-2 gap-4 sm:gap-6">
      <div class="card p-4 sm:p-6">
        <h2 class="font-semibold text-red-600 mb-4 text-sm sm:text-base">Low Stock (≤10)</h2>
        <div v-if="analytics.lowStock.length" class="space-y-3">
          <div
            v-for="p in analytics.lowStock"
            :key="p.id"
            class="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-sm"
          >
            <img :src="p.images[0]" class="w-12 h-14 object-cover shrink-0" :alt="p.name" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ formatCurrency(p.price) }}</p>
            </div>
            <span class="text-yellow-600 font-semibold text-sm shrink-0">{{ p.stock }} left</span>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm text-center py-4">All products well stocked.</p>
      </div>

      <div class="card p-4 sm:p-6">
        <h2 class="font-semibold text-red-600 mb-4 text-sm sm:text-base">Out of Stock</h2>
        <div v-if="analytics.outOfStock.length" class="space-y-3">
          <div
            v-for="p in analytics.outOfStock"
            :key="p.id"
            class="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-sm"
          >
            <img :src="p.images[0]" class="w-12 h-14 object-cover shrink-0 opacity-60" :alt="p.name" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ formatCurrency(p.price) }}</p>
            </div>
            <span class="text-red-600 font-semibold text-sm shrink-0">0</span>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm text-center py-4">No out-of-stock products.</p>
      </div>

      <div class="card p-4 sm:p-6 md:col-span-2">
        <h2 class="font-semibold mb-4 text-sm sm:text-base">Product Performance</h2>

        <!-- Mobile cards -->
        <div class="md:hidden space-y-3">
          <div
            v-for="p in analytics.topProducts"
            :key="p.name"
            class="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-sm"
          >
            <p class="text-sm font-medium flex-1 min-w-0 truncate">{{ p.name }}</p>
            <span class="text-sm font-semibold text-brand-teal dark:text-brand-orange shrink-0">{{ p.sales }} sales</span>
          </div>
        </div>

        <!-- Desktop table -->
        <div class="hidden md:block table-responsive">
          <table class="data-table">
            <thead>
              <tr class="text-left text-gray-500">
                <th class="pb-2 p-2">Product</th>
                <th class="pb-2 p-2">Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in analytics.topProducts" :key="p.name" class="border-t border-gray-200 dark:border-gray-800">
                <td class="py-2 p-2">{{ p.name }}</td>
                <td class="py-2 p-2 font-medium">{{ p.sales }} sales</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
