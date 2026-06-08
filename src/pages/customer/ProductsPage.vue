<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { productApi, vendorApi } from '@/api/services'
import type { ProductFilters } from '@/types'
import { filtersFromQuery, queryFromFilters, pageTitleFromFilters } from '@/utils/productFilters'
import { usePagination } from '@/composables/usePagination'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import Pagination from '@/components/common/Pagination.vue'
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
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="section-title">{{ pageTitle }}</h1>
        <p class="text-gray-500 text-sm mt-1">{{ total }} products</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="md:hidden p-2 border border-gray-300 dark:border-gray-700" @click="showFilters = !showFilters">
          <FunnelIcon class="w-5 h-5" />
        </button>
        <button :class="!listView ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : ''" class="p-2 border border-gray-300 dark:border-gray-700" @click="listView = false">
          <Squares2X2Icon class="w-5 h-5" />
        </button>
        <button :class="listView ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : ''" class="p-2 border border-gray-300 dark:border-gray-700" @click="listView = true">
          <ListBulletIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="flex gap-8">
      <aside class="w-64 shrink-0 space-y-6" :class="showFilters ? 'block' : 'hidden md:block'">
        <div>
          <h3 class="font-medium text-sm mb-3">Sort By</h3>
          <select v-model="filters.sort" class="input-field text-sm py-2">
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="rating">Best Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Category</h3>
          <select v-model="filters.category" class="input-field text-sm py-2">
            <option value="">All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
            <option value="accessories">Accessories</option>
            <option value="footwear">Footwear</option>
          </select>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Gender</h3>
          <select v-model="filters.gender" class="input-field text-sm py-2">
            <option :value="undefined">All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Brand</h3>
          <select v-model="filters.brand" class="input-field text-sm py-2">
            <option value="">All Brands</option>
            <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Size</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="s in sizes" :key="s"
              class="px-3 py-1 text-xs border transition-colors"
              :class="filters.size === s ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900' : 'border-gray-300 dark:border-gray-700'"
              @click="filters.size = filters.size === s ? '' : s"
            >{{ s }}</button>
          </div>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Color</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in colors" :key="c"
              class="px-3 py-1 text-xs border transition-colors"
              :class="filters.color === c ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border-gray-300 dark:border-gray-700'"
              @click="filters.color = filters.color === c ? '' : c"
            >{{ c }}</button>
          </div>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Vendor</h3>
          <select v-model="filters.vendorId" class="input-field text-sm py-2">
            <option value="">All Vendors</option>
            <option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.storeName }}</option>
          </select>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Price Range (KES)</h3>
          <div class="flex gap-2">
            <input v-model.number="filters.minPrice" type="number" placeholder="Min" class="input-field text-sm py-2" />
            <input v-model.number="filters.maxPrice" type="number" placeholder="Max" class="input-field text-sm py-2" />
          </div>
        </div>
        <div>
          <h3 class="font-medium text-sm mb-3">Min Rating</h3>
          <select v-model.number="filters.minRating" class="input-field text-sm py-2">
            <option :value="undefined">Any</option>
            <option :value="4">4+ Stars</option>
            <option :value="3">3+ Stars</option>
          </select>
        </div>
        <button class="btn-ghost text-sm w-full" @click="clearFilters">Clear Filters</button>
      </aside>

      <div class="flex-1">
        <LoadingSkeleton v-if="isLoading" :count="8" />
        <div v-else-if="paginated.length" :class="listView ? 'space-y-4' : 'grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'">
          <ProductCard v-for="p in paginated" :key="p.id" :product="p" :list-view="listView" />
        </div>
        <div v-else class="text-center py-16 text-gray-500">No products found. Try adjusting your filters.</div>

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
  </div>
</template>
