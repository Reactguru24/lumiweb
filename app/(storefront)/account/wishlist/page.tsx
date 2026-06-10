'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cart'
import { productData } from '@/lib/data/services'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/common/EmptyState'
import type { Product } from '@/lib/types'

export default function AccountWishlistPage() {
  const cart = useCartStore()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function load() {
      const results: Product[] = []
      for (const id of cart.wishlist) {
        try { results.push(await productData.getById(id)) } catch { /* skip */ }
      }
      setProducts(results)
    }
    load()
  }, [cart.wishlist])

  return (
    <div>
      {!products.length ? (
        <EmptyState title="Your wishlist is empty" description="Save items you love by clicking the heart icon." actionLabel="Browse Products" onAction={() => router.push('/products')} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
