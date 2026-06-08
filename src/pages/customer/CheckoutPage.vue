<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { orderApi, settingsApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { checkoutShippingSchema } from '@/utils/validation'
import { formatCurrency } from '@/utils/storage'
import { FREE_SHIPPING_KES } from '@/constants/commerce'
import type { Product, CartItem } from '@/types'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()

const step = ref(1)
const cartProducts = ref<(CartItem & { product: Product })[]>([])
const shippingMethods = ref<{ name: string; price: number; days: string }[]>([])
const errors = ref<Record<string, string>>({})

const form = ref({
  fullName: auth.user?.fullName || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
  street: '', city: '', state: '', country: '', zipCode: '',
  deliveryMethod: 'Standard Shipping',
  paymentMethod: 'Visa',
})

const paymentMethods = ['M-Pesa', 'Visa', 'Mastercard', 'Airtel Money']
const orderId = ref('')

onMounted(async () => {
  cartProducts.value = await cart.getCartProducts()
  const settings = await settingsApi.get()
  shippingMethods.value = settings.shippingMethods
  if (!cartProducts.value.length) router.push('/cart')
})

const subtotal = computed(() =>
  cartProducts.value.reduce((s, i) => s + i.product.price * (1 - i.product.discount / 100) * i.quantity, 0)
)
const shippingCost = computed(() => {
  const method = shippingMethods.value.find((m) => m.name === form.value.deliveryMethod)
  return subtotal.value > FREE_SHIPPING_KES ? 0 : (method?.price || 1300)
})
const total = computed(() => subtotal.value - cart.couponDiscount + shippingCost.value + subtotal.value * 0.08)

function nextStep() {
  errors.value = {}
  if (step.value === 1) {
    const result = checkoutShippingSchema.safeParse(form.value)
    if (!result.success) {
      result.error.issues.forEach((i) => { errors.value[i.path[0] as string] = i.message })
      return
    }
  }
  step.value++
}

async function placeOrder() {
  try {
    const order = await orderApi.create(auth.user!.id, {
      items: cart.activeItems,
      shippingAddress: {
        id: 'checkout',
        label: 'Shipping',
        street: form.value.street,
        city: form.value.city,
        state: form.value.state,
        country: form.value.country,
        zipCode: form.value.zipCode,
        isDefault: false,
      },
      deliveryMethod: form.value.deliveryMethod,
      paymentMethod: form.value.paymentMethod,
      couponCode: cart.couponCode || undefined,
    })
    orderId.value = order.id
    cart.clearCart()
    step.value = 4
    toast.success('Order placed successfully!')
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Order failed')
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full min-w-0">
    <h1 class="section-title mb-6 sm:mb-8">Checkout</h1>

    <!-- Steps -->
    <div class="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-10 overflow-x-auto pb-1">
      <div v-for="s in 4" :key="s" class="flex items-center shrink-0">
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium" :class="step >= s ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'">{{ s }}</div>
        <div v-if="s < 4" class="w-6 sm:w-12 h-0.5" :class="step > s ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'" />
      </div>
    </div>

    <!-- Step 1: Shipping -->
    <div v-if="step === 1" class="space-y-4 animate-slide-up">
      <h2 class="font-semibold text-lg mb-4">Shipping Information</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div><label class="text-sm font-medium">Full Name</label><input v-model="form.fullName" class="input-field mt-1" /><p v-if="errors.fullName" class="text-red-500 text-xs">{{ errors.fullName }}</p></div>
        <div><label class="text-sm font-medium">Email</label><input v-model="form.email" type="email" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Phone</label><input v-model="form.phone" class="input-field mt-1" /></div>
        <div class="md:col-span-2"><label class="text-sm font-medium">Street Address</label><input v-model="form.street" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">City</label><input v-model="form.city" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">State</label><input v-model="form.state" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Country</label><input v-model="form.country" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">ZIP Code</label><input v-model="form.zipCode" class="input-field mt-1" /></div>
      </div>
      <button class="btn-primary w-full mt-6" @click="nextStep">Continue to Delivery</button>
    </div>

    <!-- Step 2: Delivery -->
    <div v-if="step === 2" class="animate-slide-up">
      <h2 class="font-semibold text-lg mb-4">Delivery Method</h2>
      <div class="space-y-3">
        <label v-for="method in shippingMethods" :key="method.name" class="card p-4 flex items-center justify-between cursor-pointer" :class="form.deliveryMethod === method.name ? 'ring-2 ring-gray-900 dark:ring-white' : ''">
          <div class="flex items-center gap-3">
            <input v-model="form.deliveryMethod" type="radio" :value="method.name" />
            <div><p class="font-medium text-sm">{{ method.name }}</p><p class="text-xs text-gray-500">{{ method.days }}</p></div>
          </div>
          <span class="font-medium">{{ subtotal > FREE_SHIPPING_KES ? 'FREE' : formatCurrency(method.price) }}</span>
        </label>
      </div>
      <div class="flex gap-4 mt-6">
        <button class="btn-secondary flex-1" @click="step = 1">Back</button>
        <button class="btn-primary flex-1" @click="nextStep">Continue to Payment</button>
      </div>
    </div>

    <!-- Step 3: Payment -->
    <div v-if="step === 3" class="animate-slide-up">
      <h2 class="font-semibold text-lg mb-4">Payment Method</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          v-for="pm in paymentMethods" :key="pm"
          class="card p-4 text-center text-sm font-medium transition-all"
          :class="form.paymentMethod === pm ? 'ring-2 ring-gray-900 dark:ring-white' : ''"
          @click="form.paymentMethod = pm"
        >{{ pm }}</button>
      </div>
      <div class="card p-4 mb-6">
        <div class="flex justify-between text-sm mb-2"><span>Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div>
        <div class="flex justify-between text-sm mb-2"><span>Shipping</span><span>{{ shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost) }}</span></div>
        <div class="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{{ formatCurrency(total) }}</span></div>
      </div>
      <div class="flex gap-4">
        <button class="btn-secondary flex-1" @click="step = 2">Back</button>
        <button class="btn-primary flex-1" @click="placeOrder">Place Order</button>
      </div>
    </div>

    <!-- Step 4: Confirmation -->
    <div v-if="step === 4" class="text-center animate-slide-up py-12">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">✓</span>
      </div>
      <h2 class="font-display text-2xl font-semibold mb-2">Order Confirmed!</h2>
      <p class="text-gray-500 mb-2">Thank you for your purchase.</p>
      <p class="text-sm text-gray-400 mb-8">Order ID: {{ orderId }}</p>
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
        <router-link to="/account/orders" class="btn-primary">View Orders</router-link>
        <router-link to="/products" class="btn-secondary">Continue Shopping</router-link>
      </div>
    </div>
  </div>
</template>
