<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { vendorApi, analyticsApi } from '@/api/services'
import { formatCurrency } from '@/utils/storage'
import StatCard from '@/components/common/StatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { CurrencyDollarIcon, ShoppingCartIcon, CubeIcon, UsersIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()

const { data: vendor } = useQuery({
  queryKey: ['my-vendor', auth.user?.id],
  queryFn: () => vendorApi.getByUserId(auth.user!.id),
  enabled: computed(() => !!auth.user),
})

const { data: analytics, isLoading } = useQuery({
  queryKey: computed(() => ['vendor-analytics', vendor.value?.id]),
  queryFn: () => analyticsApi.getVendorAnalytics(vendor.value!.id),
  enabled: computed(() => !!vendor.value?.id),
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">Welcome back{{ vendor ? `, ${vendor.storeName}` : '' }}</h1>
    <p class="text-gray-500 text-sm mb-8">Here's what's happening with your store today.</p>

    <div v-if="isLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="i in 4" :key="i" class="skeleton h-28" />
    </div>
    <div v-else-if="analytics" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Revenue" :value="formatCurrency(analytics.revenue)" :icon="CurrencyDollarIcon" />
      <StatCard title="Orders" :value="analytics.totalOrders" :icon="ShoppingCartIcon" />
      <StatCard title="Products" :value="analytics.totalProducts" :icon="CubeIcon" />
      <StatCard title="Customers" :value="analytics.customers" :icon="UsersIcon" />
    </div>

    <div v-if="analytics" class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6">
        <h3 class="font-semibold mb-4">Sales Trend</h3>
        <LineChart
          :labels="analytics.salesTrend.map((s) => s.month)"
          :datasets="[
            { label: 'Sales', data: analytics.salesTrend.map((s) => s.sales) },
            { label: 'Revenue', data: analytics.salesTrend.map((s) => s.revenue) },
          ]"
        />
      </div>
      <div class="card p-6">
        <h3 class="font-semibold mb-4">Top Products</h3>
        <BarChart
          :labels="analytics.topProducts.map((p) => p.name.slice(0, 15))"
          :data="analytics.topProducts.map((p) => p.sales)"
          label="Sales"
        />
      </div>
    </div>
  </div>
</template>
