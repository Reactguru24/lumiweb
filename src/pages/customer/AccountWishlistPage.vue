<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { productApi } from '@/api/services'
import ProductCard from '@/components/product/ProductCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Product } from '@/types'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const router = useRouter()
const products = ref<Product[]>([])

onMounted(async () => {
  const results: Product[] = []
  for (const id of cart.wishlist) {
    try { results.push(await productApi.getById(id)) } catch { /* skip */ }
  }
  products.value = results
})
</script>

<template>
  <div>
    <EmptyState
      v-if="!products.length"
      title="Your wishlist is empty"
      description="Save items you love by clicking the heart icon."
      action-label="Browse Products"
      @action="router.push('/products')"
    />
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProductCard v-for="p in products" :key="p.id" :product="p" />
    </div>
  </div>
</template>
