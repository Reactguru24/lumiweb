<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { productApi, reviewApi, vendorApi } from '@/api/services'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/storage'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import { StarIcon } from '@heroicons/vue/24/solid'
import { HeartIcon, MagnifyingGlassPlusIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/vue/24/solid'

const route = useRoute()
const cart = useCartStore()
const toast = useToast()

const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)
const activeImage = ref(0)
const zoomed = ref(false)

const { data: product, isLoading } = useQuery({
  queryKey: ['product', route.params.id],
  queryFn: () => productApi.getById(route.params.id as string),
})

const { data: reviews } = useQuery({
  queryKey: computed(() => ['reviews', route.params.id]),
  queryFn: () => reviewApi.getByProduct(route.params.id as string),
  enabled: computed(() => !!route.params.id),
})

const { data: vendor } = useQuery({
  queryKey: computed(() => ['vendor', product.value?.vendorId]),
  queryFn: () => vendorApi.getById(product.value!.vendorId),
  enabled: computed(() => !!product.value?.vendorId),
})

const { data: similar } = useQuery({
  queryKey: computed(() => ['similar', product.value?.category]),
  queryFn: () => productApi.getAll({ category: product.value!.category, sort: 'popular' }),
  enabled: computed(() => !!product.value?.category),
})

const salePrice = computed(() => product.value ? product.value.price * (1 - product.value.discount / 100) : 0)
const inWishlist = computed(() => product.value ? cart.isInWishlist(product.value.id) : false)

function addToCart() {
  if (!product.value) return
  if (!selectedSize.value) { toast.warning('Please select a size'); return }
  if (!selectedColor.value) { toast.warning('Please select a color'); return }
  cart.addItem(product.value.id, selectedSize.value, selectedColor.value, quantity.value)
  toast.success('Added to cart!')
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <LoadingSkeleton v-if="isLoading" :count="1" height="500px" />

    <div v-else-if="product" class="grid md:grid-cols-2 gap-8 md:gap-12">
      <!-- Images -->
      <div>
        <div class="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-zoom-in" @click="zoomed = !zoomed">
          <img :src="product.images[activeImage]" :alt="product.name" class="w-full h-full object-cover transition-transform" :class="zoomed ? 'scale-150' : ''" />
          <MagnifyingGlassPlusIcon class="absolute bottom-4 right-4 w-6 h-6 text-gray-400" />
        </div>
        <div class="flex gap-2 mt-4 overflow-x-auto">
          <button
            v-for="(img, i) in product.images" :key="i"
            class="w-20 h-24 shrink-0 border-2 overflow-hidden"
            :class="activeImage === i ? 'border-gray-900 dark:border-white' : 'border-transparent'"
            @click="activeImage = i"
          >
            <img :src="img" :alt="`${product.name} ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Details -->
      <div class="animate-slide-up">
        <p class="text-sm text-gray-500 uppercase tracking-wider">{{ product.brand }}</p>
        <h1 class="font-display text-3xl font-semibold mt-1">{{ product.name }}</h1>
        <div class="flex items-center gap-2 mt-2">
          <div class="flex">
            <StarIcon v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'" />
          </div>
          <span class="text-sm text-gray-500">{{ product.rating }} ({{ product.reviewCount }} reviews)</span>
        </div>

        <div class="flex items-center gap-3 mt-4">
          <span class="text-2xl font-bold">{{ formatCurrency(salePrice) }}</span>
          <span v-if="product.discount > 0" class="text-lg text-gray-400 line-through">{{ formatCurrency(product.price) }}</span>
          <span v-if="product.discount > 0" class="text-sm text-red-600 font-medium">-{{ product.discount }}%</span>
        </div>

        <p class="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">{{ product.description }}</p>

        <!-- Vendor -->
        <div v-if="vendor" class="flex items-center gap-3 mt-6 p-4 card">
          <img :src="vendor.logo" :alt="vendor.storeName" class="w-10 h-10 rounded-full object-cover" />
          <div>
            <p class="font-medium text-sm">{{ vendor.storeName }}</p>
            <p class="text-xs text-gray-500">{{ vendor.city }}, {{ vendor.country }}</p>
          </div>
        </div>

        <!-- Size -->
        <div class="mt-6">
          <h3 class="font-medium text-sm mb-3">Size</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in product.sizes" :key="size"
              class="px-4 py-2 text-sm border transition-colors"
              :class="selectedSize === size ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900' : 'border-gray-300 dark:border-gray-700 hover:border-gray-900'"
              @click="selectedSize = size"
            >{{ size }}</button>
          </div>
        </div>

        <!-- Color -->
        <div class="mt-6">
          <h3 class="font-medium text-sm mb-3">Color: {{ selectedColor }}</h3>
          <div class="flex gap-2">
            <button
              v-for="color in product.colors" :key="color.name"
              class="w-8 h-8 rounded-full border-2 transition-all"
              :class="selectedColor === color.name ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300'"
              :style="{ backgroundColor: color.hex }"
              :title="color.name"
              @click="selectedColor = color.name"
            />
          </div>
        </div>

        <!-- Stock -->
        <p class="mt-4 text-sm" :class="product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'">
          {{ product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock' }}
        </p>

        <!-- Quantity & Actions -->
        <div class="flex items-center gap-4 mt-6">
          <div class="flex items-center border border-gray-300 dark:border-gray-700">
            <button class="px-4 py-3" @click="quantity = Math.max(1, quantity - 1)">−</button>
            <span class="px-4 py-3 border-x border-gray-300 dark:border-gray-700">{{ quantity }}</span>
            <button class="px-4 py-3" @click="quantity++">+</button>
          </div>
          <button class="btn-primary flex-1" :disabled="product.stock === 0" @click="addToCart">Add to Cart</button>
          <button class="p-3 border border-gray-300 dark:border-gray-700" @click="cart.toggleWishlist(product.id)">
            <HeartSolid v-if="inWishlist" class="w-6 h-6 text-red-500" />
            <HeartIcon v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Reviews -->
    <section v-if="reviews?.length" class="mt-16">
      <h2 class="section-title mb-6">Customer Reviews</h2>
      <div class="space-y-4">
        <div v-for="review in reviews" :key="review.id" class="card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-sm">{{ review.userName }}</p>
              <div class="flex mt-1">
                <StarIcon v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'" />
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ review.comment }}</p>
          <p v-if="review.vendorReply" class="text-sm bg-gray-50 dark:bg-gray-800 p-3 mt-2 italic">Vendor: {{ review.vendorReply }}</p>
        </div>
      </div>
    </section>

    <!-- Similar -->
    <section v-if="similar?.length" class="mt-16">
      <h2 class="section-title mb-6">Similar Products</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProductCard v-for="p in similar.filter(s => s.id !== product?.id).slice(0, 4)" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>
