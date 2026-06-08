<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { userApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/storage'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'

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

async function disableUser(id: string) {
  await userApi.disable(id)
  toast.success('Account disabled')
  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">User Management</h1>
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" placeholder="Search users..." class="input-field pl-10 py-2 text-sm w-64" />
      </div>
    </div>

    <div v-if="isLoading" class="space-y-3"><div v-for="i in 8" :key="i" class="skeleton h-14" /></div>
    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr><th class="text-left p-4">Name</th><th class="text-left p-4 hidden md:table-cell">Email</th><th class="text-left p-4">Role</th><th class="text-left p-4 hidden md:table-cell">Joined</th><th class="text-left p-4">Status</th><th class="text-right p-4">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in paginated" :key="user.id" class="border-t border-gray-200 dark:border-gray-800">
            <td class="p-4 font-medium">{{ user.fullName }}</td>
            <td class="p-4 hidden md:table-cell text-gray-500">{{ user.email }}</td>
            <td class="p-4"><span class="badge bg-gray-100 dark:bg-gray-800">{{ user.role }}</span></td>
            <td class="p-4 hidden md:table-cell text-gray-500">{{ formatDate(user.createdAt) }}</td>
            <td class="p-4"><span :class="user.disabled ? 'text-red-600' : 'text-green-600'">{{ user.disabled ? 'Disabled' : 'Active' }}</span></td>
            <td class="p-4 text-right">
              <button v-if="!user.disabled && user.role !== 'ADMIN'" class="text-xs text-red-600 hover:underline" @click="disableUser(user.id)">Disable</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="!isLoading" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
