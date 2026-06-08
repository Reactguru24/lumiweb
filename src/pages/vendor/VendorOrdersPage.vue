<script setup lang="ts">
import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { vendorApi, orderApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatCurrency, formatDate } from '@/utils/storage'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { OrderStatus } from '@/types'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'

const auth = useAuthStore()
const toast = useToast()
const queryClient = useQueryClient()

const { data: vendor } = useQuery({
  queryKey: ['my-vendor', auth.user?.id],
  queryFn: () => vendorApi.getByUserId(auth.user!.id),
})

const { data: orders, isLoading } = useQuery({
  queryKey: computed(() => ['vendor-orders', vendor.value?.id]),
  queryFn: () => orderApi.getByVendor(vendor.value!.id),
  enabled: computed(() => !!vendor.value?.id),
})

const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(orders, 8)

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

async function updateStatus(orderId: string, status: OrderStatus) {
  await orderApi.updateStatus(orderId, status)
  toast.success(`Order updated to ${status}`)
  queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Orders</h1>
    <div v-if="isLoading" class="space-y-3"><div v-for="i in 5" :key="i" class="skeleton h-24" /></div>
    <div v-else-if="orders?.length" class="space-y-4">
      <div v-for="order in paginated" :key="order.id" class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-medium text-sm">#{{ order.id.slice(-8) }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
          </div>
          <StatusBadge :status="order.status" />
        </div>
        <div class="space-y-2">
          <div v-for="item in order.items.filter(i => i.vendorId === vendor?.id)" :key="item.productId" class="flex items-center gap-3 text-sm">
            <img :src="item.productImage" class="w-10 h-12 object-cover" :alt="item.productName" />
            <div class="flex-1">
              <p>{{ item.productName }}</p>
              <p class="text-gray-500">Qty: {{ item.quantity }} · {{ item.size }} · {{ item.color }}</p>
            </div>
            <span class="font-medium">{{ formatCurrency(item.price * item.quantity) }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <span class="text-xs text-gray-500 mr-auto">Update status:</span>
          <button v-for="s in statuses" :key="s" class="px-2 py-1 text-xs border capitalize" :class="order.status === s ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : ''" @click="updateStatus(order.id, s)">{{ s }}</button>
        </div>
      </div>
    </div>
    <p v-else class="text-gray-500 text-center py-12">No orders yet.</p>
    <Pagination v-if="!isLoading && total > 0" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
