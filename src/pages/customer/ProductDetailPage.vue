<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { productApi, reviewApi, vendorApi } from '@/api/services'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/storage'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import { StarIcon } from '@heroicons/vue/24/solid'
import { HeartIcon, MagnifyingGlassPlusIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolid, StarIcon as StarOutline } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()
const queryClient = useQueryClient()

const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)
const activeImage = ref(0)
const zoomed = ref(false)
const reviewRating = ref(0)
const reviewComment = ref('')
const submittingReview = ref(false)

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
const userHasReviewed = computed(() =>
  reviews.value?.some((r) => r.userId === auth.user?.id) ?? false
)

function addToCart() {
  if (!product.value) return
  if (!selectedSize.value) { toast.warning('Please select a size'); return }
  if (!selectedColor.value) { toast.warning('Please select a color'); return }
  cart.addItem(product.value.id, selectedSize.value, selectedColor.value, quantity.value)
  toast.success('Added to cart!')
}

async function submitReview() {
  if (!auth.isAuthenticated) {
    toast.warning('Please sign in to leave a review')
    router.push({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }
  if (!product.value) return
  if (reviewRating.value < 1) {
    toast.warning('Please select a star rating')
    return
  }
  if (reviewComment.value.trim().length < 10) {
    toast.warning('Please write at least 10 characters')
    return
  }
  submittingReview.value = true
  try {
    await reviewApi.create({
      productId: product.value.id,
      userId: auth.user!.id,
      userName: auth.user!.fullName,
      rating: reviewRating.value,
      comment: reviewComment.value.trim(),
    })
    reviewRating.value = 0
    reviewComment.value = ''
    toast.success('Review submitted!')
    queryClient.invalidateQueries({ queryKey: ['reviews', route.params.id] })
    queryClient.invalidateQueries({ queryKey: ['product', route.params.id] })
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to submit review')
  } finally {
    submittingReview.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <LoadingSkeleton v-if="isLoading" :count="1" height="500px" />

    <div v-else-if="product" class="grid md:grid-cols-2 gap-6 md:gap-12">
      <!-- Images -->
      <div class="w-full max-w-md mx-auto md:max-w-none">
        <div
          class="relative w-full aspect-[4/5] max-h-[min(70vh,420px)] md:max-h-none md:aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-sm md:rounded-none"
          @click="zoomed = !zoomed"
        >
          <img
            :src="product.images[activeImage]"
            :alt="product.name"
            class="w-full h-full object-cover object-center transition-transform duration-300"
            :class="zoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'"
          />
          <MagnifyingGlassPlusIcon class="absolute bottom-3 right-3 w-5 h-5 text-white/80 drop-shadow hidden sm:block" />
        </div>
        <div class="flex gap-2 mt-3 overflow-x-auto justify-center md:justify-start pb-1 -mx-1 px-1">
          <button
            v-for="(img, i) in product.images"
            :key="i"
            type="button"
            class="w-14 h-16 sm:w-16 sm:h-20 shrink-0 border-2 overflow-hidden rounded-sm"
            :class="activeImage === i ? 'border-brand-teal dark:border-brand-orange' : 'border-gray-200 dark:border-gray-700'"
            @click="activeImage = i"
          >
            <img :src="img" :alt="`${product.name} ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Details -->
      <div class="animate-slide-up text-center md:text-left">
        <p class="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">{{ product.brand }}</p>
        <h1 class="font-display text-xl sm:text-2xl md:text-3xl font-semibold mt-1">{{ product.name }}</h1>
        <div class="flex items-center gap-2 mt-2 justify-center md:justify-start">
          <div class="flex">
            <StarIcon v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'" />
          </div>
          <span class="text-sm text-gray-500">{{ product.rating }} ({{ product.reviewCount }} reviews)</span>
        </div>

        <div class="flex items-center gap-3 mt-4 justify-center md:justify-start flex-wrap">
          <span class="text-xl sm:text-2xl font-bold">{{ formatCurrency(salePrice) }}</span>
          <span v-if="product.discount > 0" class="text-base sm:text-lg text-gray-400 line-through">{{ formatCurrency(product.price) }}</span>
          <span v-if="product.discount > 0" class="text-sm text-red-600 font-medium">-{{ product.discount }}%</span>
        </div>

        <p class="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed text-sm sm:text-base text-left md:text-left">{{ product.description }}</p>

        <!-- Vendor -->
        <div v-if="vendor" class="flex items-center gap-3 mt-6 p-4 card justify-center md:justify-start">
          <img :src="vendor.logo" :alt="vendor.storeName" class="w-10 h-10 rounded-full object-cover shrink-0" />
          <div class="text-left">
            <p class="font-medium text-sm">{{ vendor.storeName }}</p>
            <p class="text-xs text-gray-500">{{ vendor.city }}, {{ vendor.country }}</p>
          </div>
        </div>

        <!-- Size -->
        <div class="mt-6">
          <h3 class="font-medium text-sm mb-3">Size</h3>
          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              v-for="size in product.sizes"
              :key="size"
              type="button"
              class="min-w-[2.5rem] px-4 py-2 text-sm border transition-colors"
              :class="selectedSize === size ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900' : 'border-gray-300 dark:border-gray-700 hover:border-gray-900'"
              @click="selectedSize = size"
            >{{ size }}</button>
          </div>
        </div>

        <!-- Color -->
        <div class="mt-6">
          <h3 class="font-medium text-sm mb-3">Color{{ selectedColor ? `: ${selectedColor}` : '' }}</h3>
          <div class="flex gap-2 justify-center md:justify-start flex-wrap">
            <button
              v-for="color in product.colors"
              :key="color.name"
              type="button"
              class="w-8 h-8 rounded-full border-2 transition-all"
              :class="selectedColor === color.name ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300'"
              :style="{ backgroundColor: color.hex }"
              :title="color.name"
              @click="selectedColor = color.name"
            />
          </div>
        </div>

        <!-- Stock -->
        <p
          class="mt-4 text-sm"
          :class="product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'"
        >
          {{ product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock' }}
        </p>

        <!-- Quantity & Actions -->
        <div class="flex flex-col items-center md:items-start gap-3 sm:gap-4 mt-6">
          <div class="flex items-center border border-gray-300 dark:border-gray-700 w-fit">
            <button type="button" class="px-4 py-3" @click="quantity = Math.max(1, quantity - 1)">−</button>
            <span class="px-4 py-3 border-x border-gray-300 dark:border-gray-700">{{ quantity }}</span>
            <button type="button" class="px-4 py-3" @click="quantity++">+</button>
          </div>
          <div class="flex gap-2 sm:gap-4 w-full max-w-sm md:max-w-none">
            <button class="btn-primary flex-1 min-w-0 text-sm sm:text-base" :disabled="product.stock === 0" @click="addToCart">Add to Cart</button>
            <button type="button" class="p-3 border border-gray-300 dark:border-gray-700 shrink-0" @click="cart.toggleWishlist(product.id)">
              <HeartSolid v-if="inWishlist" class="w-6 h-6 text-red-500" />
              <HeartIcon v-else class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews -->
    <section class="mt-12 sm:mt-16">
      <h2 class="section-title mb-6 text-center md:text-left">Customer Reviews</h2>

      <!-- Write review -->
      <div v-if="!userHasReviewed" class="card p-4 sm:p-6 mb-6 max-w-2xl mx-auto md:mx-0">
        <h3 class="font-medium text-sm mb-4 text-center md:text-left">Write a Review</h3>
        <div v-if="!auth.isAuthenticated" class="text-center md:text-left">
          <p class="text-sm text-gray-500 mb-3">Sign in to share your experience with this product.</p>
          <router-link :to="{ path: '/auth/login', query: { redirect: route.fullPath } }" class="btn-primary text-sm py-2 inline-flex">
            Sign In to Review
          </router-link>
        </div>
        <form v-else class="space-y-4" @submit.prevent="submitReview">
          <div>
            <p class="text-sm font-medium mb-2 text-center md:text-left">Your Rating</p>
            <div class="flex gap-1 justify-center md:justify-start">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                class="p-1"
                :aria-label="`Rate ${i} stars`"
                @click="reviewRating = i"
              >
                <StarIcon v-if="i <= reviewRating" class="w-7 h-7 text-yellow-400" />
                <StarOutline v-else class="w-7 h-7 text-gray-300" />
              </button>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium block mb-2 text-center md:text-left">Your Comment</label>
            <textarea
              v-model="reviewComment"
              rows="4"
              class="input-field text-sm"
              placeholder="Tell others what you think about fit, quality, and style..."
              required
            />
          </div>
          <button type="submit" class="btn-primary w-full sm:w-auto text-sm" :disabled="submittingReview">
            {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
          </button>
        </form>
      </div>
      <p v-else class="text-sm text-gray-500 mb-6 text-center md:text-left">You have already reviewed this product.</p>

      <div v-if="reviews?.length" class="space-y-4">
        <div v-for="review in reviews" :key="review.id" class="card p-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p class="font-medium text-sm">{{ review.userName }}</p>
              <div class="flex mt-1 justify-center sm:justify-start">
                <StarIcon v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'" />
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ review.comment }}</p>
          <p v-if="review.vendorReply" class="text-sm bg-gray-50 dark:bg-gray-800 p-3 mt-2 italic">Vendor: {{ review.vendorReply }}</p>
        </div>
      </div>
      <p v-else class="text-gray-500 text-sm text-center md:text-left py-6">No reviews yet. Be the first to review!</p>
    </section>

    <!-- Similar -->
    <section v-if="similar?.length" class="mt-12 sm:mt-16">
      <h2 class="section-title mb-6 text-center md:text-left">Similar Products</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <ProductCard v-for="p in similar.filter(s => s.id !== product?.id).slice(0, 4)" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>
