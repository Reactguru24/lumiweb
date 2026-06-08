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

const { data: analytics } = useQuery({
  queryKey: computed(() => ['vendor-analytics', vendor.value?.id]),
  queryFn: () => analyticsApi.getVendorAnalytics(vendor.value!.id),
  enabled: computed(() => !!vendor.value?.id),
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Inventory Management</h1>

    <div v-if="analytics" class="grid md:grid-cols-2 gap-6">
      <div class="card p-6">
        <h2 class="font-semibold text-red-600 mb-4">Low Stock (≤10)</h2>
        <div v-if="analytics.lowStock.length" class="space-y-3">
          <div v-for="p in analytics.lowStock" :key="p.id" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-3">
              <img :src="p.images[0]" class="w-8 h-10 object-cover" :alt="p.name" />
              <span>{{ p.name }}</span>
            </div>
            <span class="text-yellow-600 font-medium">{{ p.stock }} left</span>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm">All products well stocked.</p>
      </div>

      <div class="card p-6">
        <h2 class="font-semibold text-red-600 mb-4">Out of Stock</h2>
        <div v-if="analytics.outOfStock.length" class="space-y-3">
          <div v-for="p in analytics.outOfStock" :key="p.id" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-3">
              <img :src="p.images[0]" class="w-8 h-10 object-cover" :alt="p.name" />
              <span>{{ p.name }}</span>
            </div>
            <span class="text-red-600 font-medium">0</span>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm">No out-of-stock products.</p>
      </div>

      <div class="card p-4 sm:p-6 md:col-span-2">
        <h2 class="font-semibold mb-4">Product Performance</h2>
        <div class="table-responsive">
        <table class="data-table">
          <thead><tr class="text-left text-gray-500"><th class="pb-2">Product</th><th class="pb-2">Price</th><th class="pb-2">Stock</th><th class="pb-2">Rating</th><th class="pb-2">Reviews</th></tr></thead>
          <tbody>
            <tr v-for="p in analytics.topProducts" :key="p.name" class="border-t border-gray-200 dark:border-gray-800">
              <td class="py-2">{{ p.name }}</td>
              <td class="py-2">—</td>
              <td class="py-2">—</td>
              <td class="py-2">—</td>
              <td class="py-2 font-medium">{{ p.sales }} sales</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </div>
</template>
