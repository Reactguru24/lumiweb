'use client'

import Link from 'next/link'
import { useLocalData, useHydration } from '@/lib/data/hooks'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorData, analyticsData, vendorSubscriptionData } from '@/lib/data/services'
import { formatCurrency } from '@/lib/utils/storage'
import { isFeaturedListingActive, subscriptionDaysRemaining } from '@/lib/utils/subscriptions'
import { StatCard } from '@/components/common/StatCard'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { CurrencyDollarIcon, ShoppingCartIcon, CubeIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function VendorDashboardPage() {
  const auth = useAuthStore()
  const isHydrated = useHydration()
  const vendor = useLocalData(() => auth.user ? vendorData.getByUserId(auth.user.id) : null)
  const subscription = useLocalData(() => vendor ? vendorSubscriptionData.getActive(vendor.id) : null)
  const analytics = useLocalData(() => vendor ? analyticsData.getVendorAnalytics(vendor.id) : null)

  const isFeatured = isFeaturedListingActive(subscription)

  if (!isHydrated) {
    return <div className="text-center py-16">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Welcome back{vendor ? `, ${vendor.storeName}` : ''}</h1>
      <p className="text-gray-500 text-sm mb-6">Here&apos;s what&apos;s happening with your store today.</p>

      {vendor && !isFeatured && (
        <div className="card p-5 mb-8 border-brand-orange/30 bg-brand-orange/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-brand-orange shrink-0" />
            <div>
              <p className="font-semibold">Get featured on the homepage</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Subscribe to appear in the Top Vendors section and reach more shoppers across East Africa.</p>
            </div>
          </div>
          <Link href="/vendor/subscription" className="btn-primary bg-brand-orange border-brand-orange shrink-0 text-center">View Plans</Link>
        </div>
      )}

      {vendor && isFeatured && subscription && (
        <div className="card p-4 mb-8 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
          Featured listing active · {subscriptionDaysRemaining(subscription.expiresAt)} days remaining ·{' '}
          <Link href="/vendor/subscription" className="underline font-medium">Manage</Link>
        </div>
      )}
      {analytics && (
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
