<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { orderApi } from '@/api/services'
import { formatCurrency, formatDate } from '@/utils/storage'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'

const auth = useAuthStore()
const filter = ref<'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'>('all')

const { data: orders, isLoading } = useQuery({
  queryKey: ['user-orders', auth.user?.id],
  queryFn: () => orderApi.getByUser(auth.user!.id),
  enabled: computed(() => !!auth.user),
})

const filtered = computed(() => {
  if (!orders.value) return []
  if (filter.value === 'all') return orders.value
  return orders.value.filter((o) => o.status === filter.value)
})

const { page, totalPages, paginated, total, goTo, reset, pageSize } = usePagination(filtered, 8)

watch(filter, () => reset())
</script>

<template>
  <div>
    <div class="flex gap-2 mb-6 overflow-x-auto">
      <button
        v-for="f in ['all', 'pending', 'processing', 'delivered', 'cancelled']"
        :key="f"
        class="px-4 py-2 text-sm capitalize whitespace-nowrap rounded-full transition-colors"
        :class="filter === f ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'"
        @click="filter = f as typeof filter"
      >{{ f }}</button>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="skeleton h-32" />
    </div>

    <EmptyState v-else-if="!filtered.length" title="No orders yet" description="Your order history will appear here." />

    <div v-else class="space-y-4">
      <div v-for="order in paginated" :key="order.id" class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-medium text-sm">Order #{{ order.id.slice(-8) }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
          </div>
          <StatusBadge :status="order.status" />
        </div>
        <div class="flex gap-3 overflow-x-auto">
          <div v-for="item in order.items" :key="item.productId" class="flex items-center gap-2 shrink-0">
            <img :src="item.productImage" :alt="item.productName" class="w-12 h-16 object-cover" />
            <div>
              <p class="text-sm font-medium">{{ item.productName }}</p>
              <p class="text-xs text-gray-500">Qty: {{ item.quantity }} · {{ item.size }}</p>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <span class="text-sm text-gray-500">{{ order.items.length }} item(s)</span>
          <span class="font-semibold">{{ formatCurrency(order.total) }}</span>
        </div>
      </div>
    </div>
    <Pagination v-if="!isLoading && total > 0" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
