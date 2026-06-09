<script setup lang="ts">
import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { productApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/storage'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ResponsiveDataTable from '@/components/common/ResponsiveDataTable.vue'
import type { ProductStatus } from '@/types'
import type { TableColumn } from '@/components/common/ResponsiveDataTable.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'

const toast = useToast()
const queryClient = useQueryClient()

const { data: products, isLoading } = useQuery({
  queryKey: ['admin-products'],
  queryFn: () => productApi.getAll({ status: undefined }),
})

const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(products, 15)

const columns: TableColumn[] = [
  { key: 'name', label: 'Product', width: '40%' },
  { key: 'brand', label: 'Brand', width: '20%' },
  { key: 'price', label: 'Price', width: '20%', format: formatCurrency },
  { key: 'status', label: 'Status', width: '20%' },
]

const tableData = computed(() =>
  paginated.value?.map((p) => ({
    id: String(p.id),
    name: p.name,
    image: p.images[0],
    brand: p.brand,
    price: p.price,
    status: p.status,
  })) ?? []
)

async function moderate(id: string, status: ProductStatus) {
  await productApi.moderate(id, status)
  toast.success(`Product ${status}`)
  queryClient.invalidateQueries({ queryKey: ['admin-products'] })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Product Moderation</h1>
    <div v-if="isLoading" class="space-y-3"><div v-for="i in 8" :key="i" class="skeleton h-14" /></div>
    <div v-else>
      <ResponsiveDataTable :columns="columns" :rows="tableData">
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <img :src="row.image" :alt="row.name" class="w-10 h-12 object-cover rounded" />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #actions="{ row }">
          <button v-if="row.status === 'pending'" class="text-xs text-green-600 hover:text-green-700 transition-colors" @click="moderate(row.id, 'active')">
            Approve
          </button>
          <button v-if="row.status === 'active'" class="text-xs text-yellow-600 hover:text-yellow-700 transition-colors" @click="moderate(row.id, 'hidden')">
            Hide
          </button>
          <button class="text-xs text-red-600 hover:text-red-700 transition-colors" @click="moderate(row.id, 'archived')">
            Remove
          </button>
        </template>
      </ResponsiveDataTable>
    </div>
    <Pagination v-if="!isLoading" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
