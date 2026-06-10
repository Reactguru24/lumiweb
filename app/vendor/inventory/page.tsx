'use client'

import Image from 'next/image'
import { useLocalData } from '@/lib/data/hooks'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorData, analyticsData } from '@/lib/data/services'
import { formatCurrency } from '@/lib/utils/storage'

export default function VendorInventoryPage() {
  const auth = useAuthStore()
  const vendor = useLocalData(() => auth.user ? vendorData.getByUserId(auth.user.id) : null)
  const analytics = useLocalData(() => vendor ? analyticsData.getVendorAnalytics(vendor.id) : null)

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">Inventory Management</h1>
      {analytics && (
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <h2 className="font-semibold text-red-600 mb-4 text-sm sm:text-base">Low Stock (≤10)</h2>
              {analytics.lowStock.length ? analytics.lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-sm mb-3">
                  <Image src={p.images[0]} alt={p.name} width={48} height={56} className="w-12 h-14 object-cover shrink-0" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-gray-500 mt-0.5">{formatCurrency(p.price)}</p></div>
                  <span className="text-yellow-600 font-semibold text-sm shrink-0">{p.stock} left</span>
                </div>
              )) : <p className="text-gray-500 text-sm text-center py-4">All products well stocked.</p>}
            </div>
            <div className="card p-4 sm:p-6">
              <h2 className="font-semibold text-red-600 mb-4 text-sm sm:text-base">Out of Stock</h2>
              {analytics.outOfStock.length ? analytics.outOfStock.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-sm mb-3">
                  <Image src={p.images[0]} alt={p.name} width={48} height={56} className="w-12 h-14 object-cover shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-gray-500 mt-0.5">{formatCurrency(p.price)}</p></div>
                  <span className="text-red-600 font-semibold text-sm shrink-0">0</span>
                </div>
              )) : <p className="text-gray-500 text-sm text-center py-4">No out-of-stock products.</p>}
            </div>
            <div className="card p-4 sm:p-6 md:col-span-2">
              <h2 className="font-semibold mb-4 text-sm sm:text-base">Product Performance</h2>
              <div className="md:hidden space-y-3">
                {analytics.topProducts.map((p) => (
                  <div key={p.name} className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-sm">
                    <p className="text-sm font-medium flex-1 min-w-0 truncate">{p.name}</p>
                    <span className="text-sm font-semibold text-brand-teal dark:text-brand-orange shrink-0">{p.sales} sales</span>
                  </div>
                ))}
              </div>
              <div className="hidden md:block table-responsive">
                <table className="data-table">
                  <thead><tr className="text-left text-gray-500"><th className="pb-2 p-2">Product</th><th className="pb-2 p-2">Sales</th></tr></thead>
                  <tbody>{analytics.topProducts.map((p) => <tr key={p.name} className="border-t border-gray-200 dark:border-gray-800"><td className="py-2 p-2">{p.name}</td><td className="py-2 p-2 font-medium">{p.sales} sales</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
      )}
    </div>
  )
}
