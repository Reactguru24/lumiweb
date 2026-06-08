<script setup lang="ts">
import { computed } from 'vue'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/vue/24/solid'
import { StarIcon } from '@heroicons/vue/24/solid'
import type { Product } from '@/types'
import { formatCurrency } from '@/utils/storage'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{ product: Product; listView?: boolean }>()
const cart = useCartStore()

const salePrice = computed(() => props.product.price * (1 - props.product.discount / 100))
const inWishlist = computed(() => cart.isInWishlist(props.product.id))
</script>

<template>
  <div
    class="group relative animate-fade-in"
    :class="listView ? 'flex gap-4 card p-4' : ''"
  >
    <router-link :to="`/products/${product.id}`" class="block overflow-hidden" :class="listView ? 'w-32 shrink-0' : ''">
      <div class="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          :src="product.images[0]"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span v-if="product.discount > 0" class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 font-medium">
          -{{ product.discount }}%
        </span>
        <span v-if="product.newArrival" class="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1">
          NEW
        </span>
      </div>
    </router-link>

    <div :class="listView ? 'flex-1 flex flex-col justify-center' : 'mt-3'">
      <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ product.brand }}</p>
      <router-link :to="`/products/${product.id}`">
        <h3 class="font-medium text-gray-900 dark:text-white mt-1 group-hover:underline">{{ product.name }}</h3>
      </router-link>
      <div class="flex items-center gap-1 mt-1">
        <StarIcon class="w-3.5 h-3.5 text-yellow-400" />
        <span class="text-xs text-gray-500">{{ product.rating }} ({{ product.reviewCount }})</span>
      </div>
      <div class="flex items-center gap-2 mt-2">
        <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(salePrice) }}</span>
        <span v-if="product.discount > 0" class="text-sm text-gray-400 line-through">{{ formatCurrency(product.price) }}</span>
      </div>
      <p v-if="listView" class="text-sm text-gray-500 mt-2 line-clamp-2">{{ product.description }}</p>
    </div>

    <button
      class="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      :class="{ 'opacity-100': inWishlist }"
      @click.prevent="cart.toggleWishlist(product.id)"
    >
      <HeartSolid v-if="inWishlist" class="w-5 h-5 text-red-500" />
      <HeartIcon v-else class="w-5 h-5" />
    </button>
  </div>
</template>
