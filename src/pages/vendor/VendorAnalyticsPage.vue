<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { vendorApi, analyticsApi } from '@/api/services'
import { formatCurrency } from '@/utils/storage'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

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
    <h1 class="text-2xl font-semibold mb-6">Analytics</h1>
    <div v-if="analytics" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4 text-center"><p class="text-2xl font-bold">{{ formatCurrency(analytics.revenue) }}</p><p class="text-xs text-gray-500">Revenue</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-bold">{{ analytics.totalOrders }}</p><p class="text-xs text-gray-500">Orders</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-bold">{{ analytics.totalProducts }}</p><p class="text-xs text-gray-500">Products</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-bold">{{ analytics.customers }}</p><p class="text-xs text-gray-500">Customers</p></div>
      </div>
      <div class="card p-6">
        <h3 class="font-semibold mb-4">Revenue Analytics</h3>
        <LineChart :labels="analytics.salesTrend.map(s => s.month)" :datasets="[{ label: 'Revenue', data: analytics.salesTrend.map(s => s.revenue), color: '#a88b73' }]" />
      </div>
      <div class="card p-6">
        <h3 class="font-semibold mb-4">Top Products by Sales</h3>
        <BarChart :labels="analytics.topProducts.map(p => p.name.slice(0, 20))" :data="analytics.topProducts.map(p => p.sales)" color="#1a1a1a" />
      </div>
    </div>
  </div>
</template>
