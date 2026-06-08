<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { orderApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatCurrency, formatDate } from '@/utils/storage'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { OrderStatus } from '@/types'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'

const toast = useToast()
const queryClient = useQueryClient()

const { data: orders, isLoading } = useQuery({
  queryKey: ['admin-orders'],
  queryFn: orderApi.getAll,
})

const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(orders, 10)

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

async function updateStatus(id: string, status: OrderStatus) {
  await orderApi.updateStatus(id, status)
  toast.success(`Order ${status}`)
  queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Order Monitoring</h1>
    <div v-if="isLoading" class="space-y-3"><div v-for="i in 5" :key="i" class="skeleton h-24" /></div>
    <div v-else class="space-y-4">
      <div v-for="order in paginated" :key="order.id" class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-medium text-sm">#{{ order.id.slice(-8) }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }} · {{ order.paymentMethod }}</p>
          </div>
          <div class="text-right">
            <StatusBadge :status="order.status" />
            <p class="font-semibold mt-1">{{ formatCurrency(order.total) }}</p>
          </div>
        </div>
        <div class="flex gap-3 overflow-x-auto mb-3">
          <div v-for="item in order.items" :key="item.productId" class="flex items-center gap-2 shrink-0 text-sm">
            <img :src="item.productImage" class="w-8 h-10 object-cover" :alt="item.productName" />
            <span>{{ item.productName }} ×{{ item.quantity }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Update:</span>
          <button v-for="s in statuses" :key="s" class="px-2 py-1 text-xs border capitalize" :class="order.status === s ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : ''" @click="updateStatus(order.id, s)">{{ s }}</button>
        </div>
      </div>
    </div>
    <Pagination v-if="!isLoading && total > 0" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
