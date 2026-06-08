<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { productApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/storage'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { ProductStatus } from '@/types'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'

const toast = useToast()
const queryClient = useQueryClient()

const { data: products, isLoading } = useQuery({
  queryKey: ['admin-products'],
  queryFn: () => productApi.getAll({ status: undefined }),
})

const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(products, 15)

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
    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr><th class="text-left p-4">Product</th><th class="text-left p-4 hidden md:table-cell">Brand</th><th class="text-left p-4">Price</th><th class="text-left p-4">Status</th><th class="text-right p-4">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in paginated" :key="p.id" class="border-t border-gray-200 dark:border-gray-800">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <img :src="p.images[0]" class="w-10 h-12 object-cover" :alt="p.name" />
                <span class="font-medium">{{ p.name }}</span>
              </div>
            </td>
            <td class="p-4 hidden md:table-cell text-gray-500">{{ p.brand }}</td>
            <td class="p-4">{{ formatCurrency(p.price) }}</td>
            <td class="p-4"><StatusBadge :status="p.status" /></td>
            <td class="p-4 text-right space-x-2">
              <button v-if="p.status === 'pending'" class="text-xs text-green-600 hover:underline" @click="moderate(p.id, 'active')">Approve</button>
              <button v-if="p.status === 'active'" class="text-xs text-yellow-600 hover:underline" @click="moderate(p.id, 'hidden')">Hide</button>
              <button class="text-xs text-red-600 hover:underline" @click="moderate(p.id, 'archived')">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="!isLoading" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
