import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '@/types'
import { productApi } from '@/api/services'
import { getStorage, setStorage } from '@/utils/storage'

const CART_KEY = 'lumi_cart'
const WISHLIST_KEY = 'lumi_wishlist'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(getStorage(CART_KEY, []))
  const wishlist = ref<string[]>(getStorage(WISHLIST_KEY, []))
  const couponCode = ref('')
  const couponDiscount = ref(0)

  const activeItems = computed(() => items.value.filter((i) => !i.savedForLater))
  const savedItems = computed(() => items.value.filter((i) => i.savedForLater))
  const itemCount = computed(() => activeItems.value.reduce((s, i) => s + i.quantity, 0))

  function persist() {
    setStorage(CART_KEY, items.value)
    setStorage(WISHLIST_KEY, wishlist.value)
  }

  function addItem(productId: string, size: string, color: string, quantity = 1) {
    const existing = items.value.find(
      (i) => i.productId === productId && i.size === size && i.color === color && !i.savedForLater
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ productId, quantity, size, color, savedForLater: false })
    }
    persist()
  }

  function updateQuantity(productId: string, size: string, color: string, quantity: number) {
    const item = items.value.find(
      (i) => i.productId === productId && i.size === size && i.color === color
    )
    if (item) {
      item.quantity = Math.max(1, quantity)
      persist()
    }
  }

  function removeItem(productId: string, size: string, color: string) {
    items.value = items.value.filter(
      (i) => !(i.productId === productId && i.size === size && i.color === color)
    )
    persist()
  }

  function toggleSaveForLater(productId: string, size: string, color: string) {
    const item = items.value.find(
      (i) => i.productId === productId && i.size === size && i.color === color
    )
    if (item) {
      item.savedForLater = !item.savedForLater
      persist()
    }
  }

  function moveToCart(productId: string, size: string, color: string) {
    const item = items.value.find(
      (i) => i.productId === productId && i.size === size && i.color === color
    )
    if (item) {
      item.savedForLater = false
      persist()
    }
  }

  function clearCart() {
    items.value = items.value.filter((i) => i.savedForLater)
    couponCode.value = ''
    couponDiscount.value = 0
    persist()
  }

  async function getCartProducts(): Promise<(CartItem & { product: Product })[]> {
    const result: (CartItem & { product: Product })[] = []
    for (const item of activeItems.value) {
      try {
        const product = await productApi.getById(item.productId)
        result.push({ ...item, product })
      } catch { /* skip missing */ }
    }
    return result
  }

  function toggleWishlist(productId: string) {
    const idx = wishlist.value.indexOf(productId)
    if (idx >= 0) wishlist.value.splice(idx, 1)
    else wishlist.value.push(productId)
    persist()
  }

  function isInWishlist(productId: string) {
    return wishlist.value.includes(productId)
  }

  function applyCoupon(code: string, discount: number) {
    couponCode.value = code
    couponDiscount.value = discount
  }

  return {
    items, wishlist, couponCode, couponDiscount, activeItems, savedItems, itemCount,
    addItem, updateQuantity, removeItem, toggleSaveForLater, moveToCart, clearCart,
    getCartProducts, toggleWishlist, isInWishlist, applyCoupon,
  }
})
