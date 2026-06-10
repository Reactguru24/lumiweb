'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/stores/cart'
import { useAuthStore } from '@/lib/stores/auth'
import { orderData, settingsData } from '@/lib/data/services'
import { checkoutShippingSchema } from '@/lib/utils/validation'
import { formatCurrency } from '@/lib/utils/storage'
import { FREE_SHIPPING_KES } from '@/lib/constants/commerce'
import { RouteGuard } from '@/components/layouts/RouteGuard'
import type { Product, CartItem } from '@/lib/types'

export default function CheckoutPage() {
  const router = useRouter()
  const cart = useCartStore()
  const auth = useAuthStore()
  const [step, setStep] = useState(1)
  const [cartProducts, setCartProducts] = useState<(CartItem & { product: Product })[]>([])
  const [shippingMethods, setShippingMethods] = useState<{ name: string; price: number; days: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({
    fullName: auth.user?.fullName || '', email: auth.user?.email || '', phone: auth.user?.phone || '',
    street: '', city: '', state: '', country: '', zipCode: '',
    deliveryMethod: 'Standard Shipping', paymentMethod: 'Visa',
  })
  const paymentMethods = ['M-Pesa', 'Visa', 'Mastercard', 'Airtel Money']

  useEffect(() => {
    const items = cart.getCartProducts()
    setCartProducts(items)
    if (!items.length) router.push('/cart')
    setShippingMethods(settingsData.get().shippingMethods)
  }, [cart, router])

  const subtotal = useMemo(() => cartProducts.reduce((s, i) => s + i.product.price * (1 - i.product.discount / 100) * i.quantity, 0), [cartProducts])
  const shippingCost = useMemo(() => {
    const method = shippingMethods.find((m) => m.name === form.deliveryMethod)
    return subtotal > FREE_SHIPPING_KES ? 0 : (method?.price || 1300)
  }, [subtotal, shippingMethods, form.deliveryMethod])
  const total = subtotal - cart.couponDiscount + shippingCost + subtotal * 0.08

  function nextStep() {
    setErrors({})
    if (step === 1) {
      const result = checkoutShippingSchema.safeParse(form)
      if (!result.success) {
        const next: Record<string, string> = {}
        result.error.issues.forEach((i) => { next[i.path[0] as string] = i.message })
        setErrors(next)
        return
      }
    }
    setStep(step + 1)
  }

  async function placeOrder() {
    try {
      const order = await orderData.create(auth.user!.id, {
        items: cart.activeItems,
        shippingAddress: { id: 'checkout', label: 'Shipping', street: form.street, city: form.city, state: form.state, country: form.country, zipCode: form.zipCode, isDefault: false },
        deliveryMethod: form.deliveryMethod, paymentMethod: form.paymentMethod, couponCode: cart.couponCode || undefined,
      })
      setOrderId(order.id)
      cart.clearCart()
      setStep(4)
      toast.success('Order placed successfully!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Order failed')
    }
  }

  return (
    <RouteGuard requiresAuth roles={['CUSTOMER']}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full min-w-0">
        <h1 className="section-title mb-6 sm:mb-8">Checkout</h1>
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-10 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center shrink-0">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${step >= s ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>{s}</div>
              {s < 4 && <div className={`w-6 sm:w-12 h-0.5 ${step > s ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'}`} />}
            </div>
          ))}
        </div>
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(['fullName', 'email', 'phone', 'street', 'city', 'state', 'country', 'zipCode'] as const).map((field) => (
                <div key={field} className={field === 'street' ? 'md:col-span-2' : ''}>
                  <label className="text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} type={field === 'email' ? 'email' : 'text'} className="input-field mt-1" />
                  {errors[field] && <p className="text-red-500 text-xs">{errors[field]}</p>}
                </div>
              ))}
            </div>
            <button className="btn-primary w-full mt-6" onClick={nextStep}>Continue to Delivery</button>
          </div>
        )}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="font-semibold text-lg mb-4">Delivery Method</h2>
            <div className="space-y-3">
              {shippingMethods.map((method) => (
                <label key={method.name} className={`card p-4 flex items-center justify-between cursor-pointer ${form.deliveryMethod === method.name ? 'ring-2 ring-gray-900 dark:ring-white' : ''}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={form.deliveryMethod === method.name} onChange={() => setForm({ ...form, deliveryMethod: method.name })} />
                    <div><p className="font-medium text-sm">{method.name}</p><p className="text-xs text-gray-500">{method.days}</p></div>
                  </div>
                  <span className="font-medium">{subtotal > FREE_SHIPPING_KES ? 'FREE' : formatCurrency(method.price)}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary flex-1" onClick={nextStep}>Continue to Payment</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="animate-slide-up">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {paymentMethods.map((pm) => (
                <button key={pm} className={`card p-4 text-center text-sm font-medium transition-all ${form.paymentMethod === pm ? 'ring-2 ring-gray-900 dark:ring-white' : ''}`} onClick={() => setForm({ ...form, paymentMethod: pm })}>{pm}</button>
              ))}
            </div>
            <div className="card p-4 mb-6 text-sm space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
            <div className="flex gap-4">
              <button className="btn-secondary flex-1" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary flex-1" onClick={placeOrder}>Place Order</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="text-center animate-slide-up py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✓</span></div>
            <h2 className="font-display text-2xl font-semibold mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
            <p className="text-sm text-gray-400 mb-8">Order ID: {orderId}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/account/orders" className="btn-primary">View Orders</Link>
              <Link href="/products" className="btn-secondary">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  )
}
