<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { analyticsApi } from '@/api/services'
import { formatCurrency } from '@/utils/storage'
import StatCard from '@/components/common/StatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { UsersIcon, BuildingStorefrontIcon, CubeIcon, ShoppingCartIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'

const { data: analytics, isLoading } = useQuery({
  queryKey: ['admin-analytics'],
  queryFn: analyticsApi.getAdminAnalytics,
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">Platform Dashboard</h1>
    <p class="text-gray-500 text-sm mb-8">Enterprise overview of marketplace performance.</p>

    <div v-if="isLoading" class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div v-for="i in 5" :key="i" class="skeleton h-28" />
    </div>
    <div v-else-if="analytics" class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <StatCard title="Total Users" :value="analytics.totalUsers" :icon="UsersIcon" />
      <StatCard title="Total Vendors" :value="analytics.totalVendors" :icon="BuildingStorefrontIcon" />
      <StatCard title="Total Products" :value="analytics.totalProducts" :icon="CubeIcon" />
      <StatCard title="Total Orders" :value="analytics.totalOrders" :icon="ShoppingCartIcon" />
      <StatCard title="Total Revenue" :value="formatCurrency(analytics.totalRevenue)" :icon="CurrencyDollarIcon" />
    </div>

    <div v-if="analytics" class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6">
        <h3 class="font-semibold mb-4">Monthly Sales</h3>
        <LineChart
          :labels="analytics.monthlySales.map(m => m.month)"
          :datasets="[
            { label: 'Revenue', data: analytics.monthlySales.map(m => m.revenue) },
            { label: 'Orders', data: analytics.monthlySales.map(m => m.orders) },
          ]"
        />
      </div>
      <div class="card p-6">
        <h3 class="font-semibold mb-4">Vendor Growth</h3>
        <BarChart :labels="analytics.vendorGrowth.map(v => v.month)" :data="analytics.vendorGrowth.map(v => v.count)" label="Vendors" color="#a88b73" />
      </div>
      <div class="card p-6 lg:col-span-2">
        <h3 class="font-semibold mb-4">Order Trends (30 Days)</h3>
        <LineChart :labels="analytics.orderTrends.map(o => o.date)" :datasets="[{ label: 'Orders', data: analytics.orderTrends.map(o => o.count), color: '#2563eb' }]" />
      </div>
    </div>
  </div>
</template>
