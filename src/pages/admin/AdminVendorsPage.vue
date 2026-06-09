<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { vendorApplicationApi, vendorApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/storage'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ResponsiveDataTable from '@/components/common/ResponsiveDataTable.vue'
import type { TableColumn } from '@/components/common/ResponsiveDataTable.vue'

const toast = useToast()
const queryClient = useQueryClient()
const tab = ref<'applications' | 'vendors'>('applications')
const reviewNote = ref('')

const { data: applications } = useQuery({ queryKey: ['vendor-apps'], queryFn: vendorApplicationApi.getAll })
const { data: vendors } = useQuery({ queryKey: ['admin-vendors'], queryFn: vendorApi.getAll })

const vendorColumns: TableColumn[] = [
  { key: 'storeName', label: 'Store', width: '30%' },
  { key: 'location', label: 'Location', width: '25%' },
  { key: 'productCount', label: 'Products', width: '15%' },
  { key: 'rating', label: 'Rating', width: '15%' },
]

const vendorTableData = computed(() =>
  vendors.value?.map((v) => ({
    id: v.id,
    storeName: v.storeName,
    logo: v.logo,
    location: `${v.city}, ${v.country}`,
    productCount: v.productCount,
    rating: v.rating,
  })) ?? []
)

async function approve(id: string) {
  await vendorApplicationApi.approve(id)
  toast.success('Vendor approved')
  queryClient.invalidateQueries({ queryKey: ['vendor-apps'] })
  queryClient.invalidateQueries({ queryKey: ['admin-vendors'] })
}

async function reject(id: string) {
  await vendorApplicationApi.reject(id, reviewNote.value || 'Application rejected')
  toast.success('Application rejected')
  reviewNote.value = ''
  queryClient.invalidateQueries({ queryKey: ['vendor-apps'] })
}

async function suspend(id: string) {
  await vendorApi.suspend(id)
  toast.success('Vendor suspended')
  queryClient.invalidateQueries({ queryKey: ['admin-vendors'] })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Vendor Management</h1>
    <div class="flex gap-2 mb-6">
      <button class="px-4 py-2 text-sm rounded-lg" :class="tab === 'applications' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'" @click="tab = 'applications'">Applications</button>
      <button class="px-4 py-2 text-sm rounded-lg" :class="tab === 'vendors' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'" @click="tab = 'vendors'">Active Vendors</button>
    </div>

    <div v-if="tab === 'applications'" class="space-y-4">
      <div v-for="app in applications" :key="app.id" class="card p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <img :src="app.logo" class="w-12 h-12 rounded-full object-cover" :alt="app.storeName" />
            <div>
              <h3 class="font-semibold">{{ app.storeName }}</h3>
              <p class="text-sm text-gray-500">{{ app.businessEmail }} · {{ app.city }}, {{ app.country }}</p>
            </div>
          </div>
          <StatusBadge :status="app.status" />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ app.businessDescription }}</p>
        <div class="flex flex-wrap gap-2 mb-3">
          <span v-for="cat in app.categories" :key="cat" class="badge bg-gray-100 dark:bg-gray-800">{{ cat }}</span>
        </div>
        <div class="text-xs text-gray-500 space-y-1 mb-4">
          <p>Registration: {{ app.registrationNumber }}</p>
          <p>Risk Status: <span class="capitalize font-medium">{{ app.riskStatus }}</span></p>
          <p>Submitted: {{ formatDate(app.submittedAt) }}</p>
        </div>
        <div v-if="app.status === 'pending'" class="flex flex-col sm:flex-row sm:items-center gap-3">
          <input v-model="reviewNote" placeholder="Review note (optional)" class="input-field text-sm py-2 flex-1 min-w-0" />
          <div class="flex gap-2 shrink-0">
            <button class="btn-primary text-sm py-2 flex-1 sm:flex-none" @click="approve(app.id)">Approve</button>
            <button class="btn-secondary text-sm py-2 text-red-600 border-red-600 flex-1 sm:flex-none" @click="reject(app.id)">Reject</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <ResponsiveDataTable :columns="vendorColumns" :rows="vendorTableData">
        <template #cell-storeName="{ row }">
          <div class="flex items-center gap-3">
            <img :src="row.logo" :alt="row.storeName" class="w-8 h-8 rounded-full object-cover" />
            <span class="font-medium">{{ row.storeName }}</span>
          </div>
        </template>
        <template #cell-rating="{ row }">
          <span>★ {{ row.rating }}</span>
        </template>
        <template #actions="{ row }">
          <button class="text-xs text-red-600 hover:text-red-700 transition-colors" @click="suspend(row.id)">
            Suspend
          </button>
        </template>
      </ResponsiveDataTable>
    </div>
  </div>
</template>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>
