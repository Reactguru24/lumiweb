'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/lib/stores/cart'
import { settingsData } from '@/lib/data/services'
import { formatCurrency } from '@/lib/utils/storage'
import { FREE_SHIPPING_KES, STANDARD_SHIPPING_KES } from '@/lib/constants/commerce'
import { EmptyState } from '@/components/common/EmptyState'
import type { Product, CartItem } from '@/lib/types'

export default function CartPage() {
  const router = useRouter()
  const cart = useCartStore()
  const [cartProducts, setCartProducts] = useState<(CartItem & { product: Product })[]>([])
  const [couponInput, setCouponInput] = useState('')
  const [taxRate, setTaxRate] = useState(0.08)

  useEffect(() => {
    setCartProducts(cart.getCartProducts())
    setTaxRate(settingsData.get().taxRate)
  }, [cart])

  const subtotal = useMemo(() => cartProducts.reduce((s, i) => s + i.product.price * (1 - i.product.discount / 100) * i.quantity, 0), [cartProducts])
  const shipping = subtotal > FREE_SHIPPING_KES ? 0 : STANDARD_SHIPPING_KES
  const tax = (subtotal - cart.couponDiscount) * taxRate
  const total = subtotal - cart.couponDiscount + shipping + tax

  function refresh() { setCartProducts(cart.getCartProducts()) }

  async function applyCoupon() {
    const settings = await settingsData.get()
    const coupon = settings.coupons.find((c) => c.code.toUpperCase() === couponInput.toUpperCase() && c.active)
    if (!coupon) { cart.applyCoupon('', 0); return }
    if (subtotal < coupon.minOrder) return
    const discount = coupon.type === 'percentage' ? subtotal * (coupon.discount / 100) : coupon.discount
    cart.applyCoupon(coupon.code, discount)
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Shopping Cart</h1>
      {!cartProducts.length ? (
        <EmptyState title="Your cart is empty" description="Browse our collection and add items to your cart." actionLabel="Continue Shopping" onAction={() => router.push('/products')} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartProducts.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Image src={item.product.images[0]} alt={item.product.name} width={96} height={128} className="w-full sm:w-24 h-40 sm:h-32 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base line-clamp-2">{item.product.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.product.brand} · {item.size} · {item.color}</p>
                  <p className="font-semibold mt-2">{formatCurrency(item.product.price * (1 - item.product.discount / 100))}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 text-sm">
                      <button className="px-3 py-1" onClick={() => { cart.updateQuantity(item.productId, item.size, item.color, item.quantity - 1); refresh() }}>−</button>
                      <span className="px-3 py-1 border-x border-gray-300 dark:border-gray-700">{item.quantity}</span>
                      <button className="px-3 py-1" onClick={() => { cart.updateQuantity(item.productId, item.size, item.color, item.quantity + 1); refresh() }}>+</button>
                    </div>
                    <button className="text-sm text-gray-500 hover:underline" onClick={() => { cart.toggleSaveForLater(item.productId, item.size, item.color); refresh() }}>Save for Later</button>
                    <button className="text-sm text-red-600 hover:underline" onClick={() => { cart.removeItem(item.productId, item.size, item.color); refresh() }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-4 sm:p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(tax)}</span></div>
              {cart.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(cart.couponDiscount)}</span></div>}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-semibold text-base"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="input-field text-sm py-2 flex-1" />
              <button className="btn-secondary text-sm py-2 px-4" onClick={applyCoupon}>Apply</button>
            </div>
            <button className="btn-primary w-full mt-6" onClick={() => router.push('/checkout')}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  )
}
