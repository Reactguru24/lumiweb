<script setup lang="ts">
import type { ProductFilters } from '@/types'
import type { Vendor } from '@/types'

const filters = defineModel<ProductFilters>({ required: true })

defineProps<{
  vendors?: Vendor[]
  brands: string[]
  sizes: string[]
  colors: string[]
}>()

const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <div class="space-y-5">
    <div>
      <h3 class="font-medium text-sm mb-2">Sort By</h3>
      <select v-model="filters.sort" class="input-field text-sm py-2.5">
        <option value="newest">Newest</option>
        <option value="popular">Popular</option>
        <option value="rating">Best Rated</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Category</h3>
      <select v-model="filters.category" class="input-field text-sm py-2.5">
        <option value="">All</option>
        <option value="men">Men</option>
        <option value="women">Women</option>
        <option value="kids">Kids</option>
        <option value="accessories">Accessories</option>
        <option value="footwear">Footwear</option>
      </select>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Gender</h3>
      <select v-model="filters.gender" class="input-field text-sm py-2.5">
        <option :value="undefined">All</option>
        <option value="men">Men</option>
        <option value="women">Women</option>
        <option value="kids">Kids</option>
        <option value="unisex">Unisex</option>
      </select>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Brand</h3>
      <select v-model="filters.brand" class="input-field text-sm py-2.5">
        <option value="">All Brands</option>
        <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
      </select>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Size</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in sizes" :key="s"
          type="button"
          class="min-w-[2.5rem] px-3 py-2 text-xs border transition-colors"
          :class="filters.size === s ? 'bg-brand-teal text-white dark:bg-brand-orange border-brand-teal dark:border-brand-orange' : 'border-gray-300 dark:border-gray-700'"
          @click="filters.size = filters.size === s ? '' : s"
        >{{ s }}</button>
      </div>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Color</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in colors" :key="c"
          type="button"
          class="px-3 py-2 text-xs border transition-colors"
          :class="filters.color === c ? 'bg-brand-teal text-white dark:bg-brand-orange border-brand-teal dark:border-brand-orange' : 'border-gray-300 dark:border-gray-700'"
          @click="filters.color = filters.color === c ? '' : c"
        >{{ c }}</button>
      </div>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Vendor</h3>
      <select v-model="filters.vendorId" class="input-field text-sm py-2.5">
        <option value="">All Vendors</option>
        <option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.storeName }}</option>
      </select>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Price Range (KES)</h3>
      <div class="grid grid-cols-2 gap-2">
        <input v-model.number="filters.minPrice" type="number" placeholder="Min" class="input-field text-sm py-2.5" />
        <input v-model.number="filters.maxPrice" type="number" placeholder="Max" class="input-field text-sm py-2.5" />
      </div>
    </div>
    <div>
      <h3 class="font-medium text-sm mb-2">Min Rating</h3>
      <select v-model.number="filters.minRating" class="input-field text-sm py-2.5">
        <option :value="undefined">Any</option>
        <option :value="4">4+ Stars</option>
        <option :value="3">3+ Stars</option>
      </select>
    </div>
    <button type="button" class="btn-ghost text-sm w-full md:hidden" @click="emit('clear')">Clear All Filters</button>
  </div>
</template>
