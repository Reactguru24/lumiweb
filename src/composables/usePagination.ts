import { ref, computed, watch, type Ref } from 'vue'

export function usePagination<T>(items: Ref<T[] | undefined>, pageSize = 12) {
  const page = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil((items.value?.length ?? 0) / pageSize)))

  const paginated = computed(() => {
    if (!items.value) return []
    const start = (page.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  const total = computed(() => items.value?.length ?? 0)

  function goTo(p: number) {
    page.value = Math.min(Math.max(1, p), totalPages.value)
  }

  function reset() {
    page.value = 1
  }

  watch(items, () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  })

  return { page, totalPages, paginated, total, goTo, reset, pageSize }
}
