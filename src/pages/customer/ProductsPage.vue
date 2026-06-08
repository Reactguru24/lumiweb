<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { productApi, vendorApi } from '@/api/services'
import type { ProductFilters } from '@/types'
import { filtersFromQuery, queryFromFilters, pageTitleFromFilters } from '@/utils/productFilters'
import { usePagination } from '@/composables/usePagination'
import ProductCard from '@/components/product/ProductCard.vue'
import ProductFiltersPanel from '@/components/product/ProductFiltersPanel.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import Pagination from '@/components/common/Pagination.vue'
import MobileDrawer from '@/components/common/MobileDrawer.vue'
import { Squares2X2Icon, ListBulletIcon, FunnelIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

const filters = ref<ProductFilters>(filtersFromQuery(route.query))
const listView = ref(false)
const showFilters = ref(false)
const syncingFromRoute = ref(false)

const { data: products, isLoading } = useQuery({
  queryKey: computed(() => ['products', { ...filters.value }]),
  queryFn: () => productApi.getAll(filters.value),
})

const { page, totalPages, paginated, total, goTo, reset, pageSize } = usePagination(products, 12)

const pageTitle = computed(() => pageTitleFromFilters(filters.value))

const { data: vendors } = useQuery({ queryKey: ['vendors'], queryFn: vendorApi.getAll })

const brands = ['Sol Generation', 'Vivo Activewear', 'Nike', 'Adidas', 'Levi\'s', 'H&M', 'Zara', 'Suave Kenya']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = ['Black', 'White', 'Navy', 'Grey', 'Beige', 'Red', 'Blue']

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.category) count++
  if (filters.value.subcategory) count++
  if (filters.value.gender) count++
  if (filters.value.brand) count++
  if (filters.value.size) count++
  if (filters.value.color) count++
  if (filters.value.vendorId) count++
  if (filters.value.minPrice) count++
  if (filters.value.maxPrice) count++
  if (filters.value.minRating) count++
  if (filters.value.featured) count++
  if (filters.value.trending) count++
  if (filters.value.onSale) count++
  if (filters.value.search) count++
  return count
})

watch(() => route.query, (query) => {
  syncingFromRoute.value = true
  filters.value = filtersFromQuery(query)
  const p = query.page ? Number(query.page) : 1
  goTo(p)
  syncingFromRoute.value = false
}, { immediate: true })

watch(filters, (f) => {
  if (syncingFromRoute.value) return
  reset()
  router.replace({ query: queryFromFilters(f) })
}, { deep: true })

watch(page, (p) => {
  if (syncingFromRoute.value) return
  router.replace({ query: queryFromFilters(filters.value, p) })
})

function clearFilters() {
  filters.value = { sort: 'newest' }
  showFilters.value = false
}

function applyFilters() {
  showFilters.value = false
}
</script>

<template>
  <div class="page-container">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="min-w-0">
        <h1 class="section-title truncate">{{ pageTitle }}</h1>
        <p class="text-gray-500 text-sm mt-1">{{ total }} products</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="md:hidden relative inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium"
          @click="showFilters = true"
        >
          <FunnelIcon class="w-4 h-4" />
          Filters
          <span v-if="activeFilterCount" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-orange text-white text-[10px] rounded-full flex items-center justify-center">
            {{ activeFilterCount }}
          </span>
        </button>
        <button
          type="button"
          :class="!listView ? 'bg-brand-teal text-white dark:bg-brand-orange' : ''"
          class="p-2 border border-gray-300 dark:border-gray-700"
          aria-label="Grid view"
          @click="listView = false"
        >
          <Squares2X2Icon class="w-5 h-5" />
        </button>
        <button
          type="button"
          :class="listView ? 'bg-brand-teal text-white dark:bg-brand-orange' : ''"
          class="p-2 border border-gray-300 dark:border-gray-700"
          aria-label="List view"
          @click="listView = true"
        >
          <ListBulletIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-6 md:gap-8">
      <!-- Desktop filters -->
      <aside class="hidden md:block w-64 lg:w-72 shrink-0">
        <div class="sticky top-24 space-y-6 card p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-sm">Filters</h2>
            <button type="button" class="text-xs text-gray-500 hover:underline" @click="clearFilters">Clear</button>
          </div>
          <ProductFiltersPanel
            v-model="filters"
            :vendors="vendors"
            :brands="brands"
            :sizes="sizes"
            :colors="colors"
            @clear="clearFilters"
          />
        </div>
      </aside>

      <!-- Products -->
      <div class="flex-1 min-w-0">
        <LoadingSkeleton v-if="isLoading" :count="8" />
        <div
          v-else-if="paginated.length"
          :class="listView ? 'space-y-4' : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6'"
        >
          <ProductCard v-for="p in paginated" :key="p.id" :product="p" :list-view="listView" />
        </div>
        <div v-else class="text-center py-16 text-gray-500 px-4">
          No products found. Try adjusting your filters.
        </div>

        <Pagination
          v-if="!isLoading && total > 0"
          :page="page"
          :total-pages="totalPages"
          :total="total"
          :page-size="pageSize"
          @update:page="goTo"
        />
      </div>
    </div>

    <!-- Mobile filter drawer -->
    <MobileDrawer v-model:open="showFilters" title="Filter Products">
      <ProductFiltersPanel
        v-model="filters"
        :vendors="vendors"
        :brands="brands"
        :sizes="sizes"
        :colors="colors"
        @clear="clearFilters"
      />
      <template #footer>
        <div class="flex gap-3">
          <button type="button" class="btn-secondary flex-1 text-sm py-3" @click="clearFilters">Clear</button>
          <button type="button" class="btn-primary flex-1 text-sm py-3" @click="applyFilters">Show {{ total }} Results</button>
        </div>
      </template>
    </MobileDrawer>
  </div>
</template>
