'use client'

import { useLocalData } from '@/lib/data/hooks'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorData, analyticsData } from '@/lib/data/services'
import { formatCurrency } from '@/lib/utils/storage'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'

export default function VendorAnalyticsPage() {
  const auth = useAuthStore()
  const vendor = useLocalData(() => auth.user ? vendorData.getByUserId(auth.user.id) : null)
  const analytics = useLocalData(() => vendor ? analyticsData.getVendorAnalytics(vendor.id) : null)

  if (!analytics) return null

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center"><p className="text-2xl font-bold">{formatCurrency(analytics.revenue)}</p><p className="text-xs text-gray-500">Revenue</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-bold">{analytics.totalOrders}</p><p className="text-xs text-gray-500">Orders</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-bold">{analytics.totalProducts}</p><p className="text-xs text-gray-500">Products</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-bold">{analytics.customers}</p><p className="text-xs text-gray-500">Customers</p></div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Revenue Analytics</h3>
          <LineChart labels={analytics.salesTrend.map((s) => s.month)} datasets={[{ label: 'Revenue', data: analytics.salesTrend.map((s) => s.revenue), color: '#a88b73' }]} />
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Products by Sales</h3>
          <BarChart labels={analytics.topProducts.map((p) => p.name.slice(0, 20))} data={analytics.topProducts.map((p) => p.sales)} color="#1a1a1a" />
        </div>
      </div>
    </div>
  )
}
