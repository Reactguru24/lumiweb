<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { userApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/storage'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'
import ResponsiveDataTable from '@/components/common/ResponsiveDataTable.vue'
import type { TableColumn } from '@/components/common/ResponsiveDataTable.vue'

const toast = useToast()
const queryClient = useQueryClient()
const search = ref('')

const { data: users, isLoading } = useQuery({
  queryKey: ['admin-users'],
  queryFn: userApi.getAll,
})

const filtered = computed(() => {
  if (!users.value) return []
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(filtered, 15)

const columns: TableColumn[] = [
  { key: 'fullName', label: 'Name', width: '25%' },
  { key: 'email', label: 'Email', width: '30%' },
  { key: 'role', label: 'Role', width: '15%' },
  { key: 'createdAt', label: 'Joined', width: '20%', format: formatDate },
  { key: 'disabled', label: 'Status', width: '10%', format: (v) => v ? 'Disabled' : 'Active' },
]

const tableData = computed(() =>
  paginated.value?.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    disabled: user.disabled,
  })) ?? []
)

async function disableUser(id: string) {
  await userApi.disable(id)
  toast.success('Account disabled')
  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-semibold">User Management</h1>
      <div class="relative w-full sm:w-auto">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" placeholder="Search users..." class="input-field pl-10 py-2 text-sm w-full sm:w-64" />
      </div>
    </div>

    <div v-if="isLoading" class="space-y-3"><div v-for="i in 8" :key="i" class="skeleton h-14" /></div>
    <div v-else>
      <ResponsiveDataTable :columns="columns" :rows="tableData">
        <template #cell-role="{ row }">
          <span class="badge bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{{ row.role }}</span>
        </template>
        <template #actions="{ row }">
          <button v-if="!row.disabled && row.role !== 'ADMIN'" class="text-xs text-red-600 hover:text-red-700 transition-colors" @click="disableUser(row.id)">
            Disable
          </button>
        </template>
      </ResponsiveDataTable>
    </div>
    <Pagination v-if="!isLoading" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
