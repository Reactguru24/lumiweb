<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  page: number
  totalPages: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{ 'update:page': [page: number] }>()

function go(p: number) {
  if (p >= 1 && p <= props.totalPages) emit('update:page', p)
}

const pages = computed(() => {
  const result: (number | '...')[] = []
  const { page, totalPages } = props
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) result.push(i)
    return result
  }
  result.push(1)
  if (page > 3) result.push('...')
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) result.push(i)
  if (page < totalPages - 2) result.push('...')
  result.push(totalPages)
  return result
})

const rangeStart = computed(() => (props.page - 1) * props.pageSize + 1)
const rangeEnd = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>

<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
    <p class="text-sm text-gray-500">
      Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
    </p>
    <nav class="flex items-center gap-1" aria-label="Pagination">
      <button
        class="control-button !p-1.5"
        :disabled="page <= 1"
        aria-label="Previous page"
        @click="go(page - 1)"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>
      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <span v-if="p === '...'" class="px-2 text-gray-400">…</span>
        <button
          v-else
          class="min-w-[2rem] h-8 text-sm font-medium rounded-sm transition-colors"
          :class="p === page ? 'bg-brand-teal text-white dark:bg-brand-orange' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
          @click="go(p)"
        >{{ p }}</button>
      </template>
      <button
        class="control-button !p-1.5"
        :disabled="page >= totalPages"
        aria-label="Next page"
        @click="go(page + 1)"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </nav>
  </div>
</template>
