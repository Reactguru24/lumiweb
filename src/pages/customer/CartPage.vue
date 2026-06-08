<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { settingsApi } from '@/api/services'
import { formatCurrency } from '@/utils/storage'
import { FREE_SHIPPING_KES, STANDARD_SHIPPING_KES } from '@/constants/commerce'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Product, CartItem } from '@/types'

const router = useRouter()
const cart = useCartStore()
const cartProducts = ref<(CartItem & { product: Product })[]>([])
const couponInput = ref('')
const taxRate = ref(0.08)

onMounted(async () => {
  cartProducts.value = await cart.getCartProducts()
  const settings = await settingsApi.get()
  taxRate.value = settings.taxRate
})

const subtotal = computed(() =>
  cartProducts.value.reduce((s, i) => s + i.product.price * (1 - i.product.discount / 100) * i.quantity, 0)
)
const shipping = computed(() => subtotal.value > FREE_SHIPPING_KES ? 0 : STANDARD_SHIPPING_KES)
const tax = computed(() => (subtotal.value - cart.couponDiscount) * taxRate.value)
const total = computed(() => subtotal.value - cart.couponDiscount + shipping.value + tax.value)

async function refresh() {
  cartProducts.value = await cart.getCartProducts()
}

async function applyCoupon() {
  const settings = await settingsApi.get()
  const coupon = settings.coupons.find((c) => c.code.toUpperCase() === couponInput.value.toUpperCase() && c.active)
  if (!coupon) { cart.applyCoupon('', 0); return }
  if (subtotal.value < coupon.minOrder) return
  const discount = coupon.type === 'percentage' ? subtotal.value * (coupon.discount / 100) : coupon.discount
  cart.applyCoupon(coupon.code, discount)
}

function remove(productId: string, size: string, color: string) {
  cart.removeItem(productId, size, color)
  refresh()
}
</script>

<template>
  <div class="page-container">
    <h1 class="section-title mb-8">Shopping Cart</h1>

    <EmptyState
      v-if="!cartProducts.length"
      title="Your cart is empty"
      description="Browse our collection and add items to your cart."
      action-label="Continue Shopping"
      @action="router.push('/products')"
    />

    <div v-else class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-4">
        <div v-for="item in cartProducts" :key="`${item.productId}-${item.size}-${item.color}`" class="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <img :src="item.product.images[0]" :alt="item.product.name" class="w-full sm:w-24 h-40 sm:h-32 object-cover shrink-0" />
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-sm sm:text-base line-clamp-2">{{ item.product.name }}</h3>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ item.product.brand }} · {{ item.size }} · {{ item.color }}</p>
            <p class="font-semibold mt-2">{{ formatCurrency(item.product.price * (1 - item.product.discount / 100)) }}</p>
            <div class="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
              <div class="flex items-center border border-gray-300 dark:border-gray-700 text-sm">
                <button class="px-3 py-1" @click="cart.updateQuantity(item.productId, item.size, item.color, item.quantity - 1); refresh()">−</button>
                <span class="px-3 py-1 border-x border-gray-300 dark:border-gray-700">{{ item.quantity }}</span>
                <button class="px-3 py-1" @click="cart.updateQuantity(item.productId, item.size, item.color, item.quantity + 1); refresh()">+</button>
              </div>
              <button class="text-sm text-gray-500 hover:underline" @click="cart.toggleSaveForLater(item.productId, item.size, item.color); refresh()">Save for Later</button>
              <button class="text-sm text-red-600 hover:underline" @click="remove(item.productId, item.size, item.color)">Remove</button>
            </div>
          </div>
        </div>

        <!-- Saved for later -->
        <div v-if="cart.savedItems.length" class="mt-8">
          <h2 class="font-medium mb-4">Saved for Later</h2>
          <div v-for="item in cart.savedItems" :key="`saved-${item.productId}`" class="card p-4 flex justify-between items-center">
            <span class="text-sm">{{ item.productId }} · {{ item.size }} · {{ item.color }}</span>
            <button class="text-sm hover:underline" @click="cart.moveToCart(item.productId, item.size, item.color); refresh()">Move to Cart</button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="card p-4 sm:p-6 h-fit lg:sticky lg:top-24">
        <h2 class="font-semibold mb-4">Order Summary</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between"><span class="text-gray-500">Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Shipping</span><span>{{ shipping === 0 ? 'FREE' : formatCurrency(shipping) }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Tax</span><span>{{ formatCurrency(tax) }}</span></div>
          <div v-if="cart.couponDiscount" class="flex justify-between text-green-600"><span>Discount</span><span>-{{ formatCurrency(cart.couponDiscount) }}</span></div>
          <div class="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-semibold text-base">
            <span>Total</span><span>{{ formatCurrency(total) }}</span>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <input v-model="couponInput" placeholder="Coupon code" class="input-field text-sm py-2 flex-1" />
          <button class="btn-secondary text-sm py-2 px-4" @click="applyCoupon">Apply</button>
        </div>

        <button class="btn-primary w-full mt-6" @click="router.push('/checkout')">Proceed to Checkout</button>
      </div>
    </div>
  </div>
</template>
