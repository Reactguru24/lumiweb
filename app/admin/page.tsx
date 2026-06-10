'use client'

import { useLocalData } from '@/lib/data/hooks'
import { analyticsData } from '@/lib/data/services'
import { formatCurrency } from '@/lib/utils/storage'
import { StatCard } from '@/components/common/StatCard'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { UsersIcon, BuildingStorefrontIcon, CubeIcon, ShoppingCartIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const analytics = useLocalData(() => analyticsData.getAdminAnalytics())

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Platform Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Enterprise overview of marketplace performance.</p>
      {analytics && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard title="Total Users" value={analytics.totalUsers} icon={UsersIcon} />
              <StatCard title="Total Vendors" value={analytics.totalVendors} icon={BuildingStorefrontIcon} />
              <StatCard title="Total Products" value={analytics.totalProducts} icon={CubeIcon} />
              <StatCard title="Total Orders" value={analytics.totalOrders} icon={ShoppingCartIcon} />
              <StatCard title="Total Revenue" value={formatCurrency(analytics.totalRevenue)} icon={CurrencyDollarIcon} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Monthly Sales</h3>
                <LineChart labels={analytics.monthlySales.map((m) => m.month)} datasets={[{ label: 'Revenue', data: analytics.monthlySales.map((m) => m.revenue) }, { label: 'Orders', data: analytics.monthlySales.map((m) => m.orders) }]} />
              </div>
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Vendor Growth</h3>
                <BarChart labels={analytics.vendorGrowth.map((v) => v.month)} data={analytics.vendorGrowth.map((v) => v.count)} label="Vendors" color="#a88b73" />
              </div>
              <div className="card p-6 lg:col-span-2">
                <h3 className="font-semibold mb-4">Order Trends (30 Days)</h3>
                <LineChart labels={analytics.orderTrends.map((o) => o.date)} datasets={[{ label: 'Orders', data: analytics.orderTrends.map((o) => o.count), color: '#2563eb' }]} />
              </div>
            </div>
          </>
      )}
    </div>
  )
}
