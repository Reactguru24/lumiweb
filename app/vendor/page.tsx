'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorApi, analyticsApi } from '@/lib/api/services'
import { formatCurrency } from '@/lib/utils/storage'
import { StatCard } from '@/components/common/StatCard'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { CurrencyDollarIcon, ShoppingCartIcon, CubeIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function VendorDashboardPage() {
  const auth = useAuthStore()
  const { data: vendor } = useQuery({ queryKey: ['my-vendor', auth.user?.id], queryFn: () => vendorApi.getByUserId(auth.user!.id), enabled: !!auth.user })
  const { data: analytics, isLoading } = useQuery({ queryKey: ['vendor-analytics', vendor?.id], queryFn: () => analyticsApi.getVendorAnalytics(vendor!.id), enabled: !!vendor?.id })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Welcome back{vendor ? `, ${vendor.storeName}` : ''}</h1>
      <p className="text-gray-500 text-sm mb-8">Here&apos;s what&apos;s happening with your store today.</p>
      {isLoading ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28" />)}</div>
        : analytics && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Revenue" value={formatCurrency(analytics.revenue)} icon={CurrencyDollarIcon} />
              <StatCard title="Orders" value={analytics.totalOrders} icon={ShoppingCartIcon} />
              <StatCard title="Products" value={analytics.totalProducts} icon={CubeIcon} />
              <StatCard title="Customers" value={analytics.customers} icon={UsersIcon} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Sales Trend</h3>
                <LineChart labels={analytics.salesTrend.map((s) => s.month)} datasets={[{ label: 'Sales', data: analytics.salesTrend.map((s) => s.sales) }, { label: 'Revenue', data: analytics.salesTrend.map((s) => s.revenue) }]} />
              </div>
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Top Products</h3>
                <BarChart labels={analytics.topProducts.map((p) => p.name.slice(0, 15))} data={analytics.topProducts.map((p) => p.sales)} label="Sales" />
              </div>
            </div>
          </>
        )}
    </div>
  )
}
