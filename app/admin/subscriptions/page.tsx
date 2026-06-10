'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLocalData } from '@/lib/data/hooks'
import { notifyLocalDataChange } from '@/lib/data/events'
import { toast } from 'sonner'
import { vendorSubscriptionData, vendorData } from '@/lib/data/services'
import { formatCurrency, formatDate } from '@/lib/utils/storage'
import { getFeaturedListingPlan } from '@/lib/constants/subscriptions'
import { StatusBadge } from '@/components/common/StatusBadge'
import { isFeaturedListingActive } from '@/lib/utils/subscriptions'

export default function AdminSubscriptionsPage() {
  const subscriptions = useLocalData(() => vendorSubscriptionData.getAll())
  const vendors = useLocalData(() => vendorData.getAll())
  const [createForm, setCreateForm] = useState({ vendorId: '', plan: 'monthly' as 'monthly' | 'quarterly' | 'biannual' | 'yearly', paymentMethod: 'card' })

  const subscriptionDetails = subscriptions.map((sub) => {
    const vendor = vendors.find((v) => v.id === sub.vendorId)
    const plan = getFeaturedListingPlan(sub.plan)
    const isActive = isFeaturedListingActive(sub)
    const daysLeft = Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return {
      id: sub.id,
      vendorId: sub.vendorId,
      vendorName: vendor?.storeName || 'Unknown Vendor',
      vendorLogo: vendor?.logo,
      plan: sub.plan,
      planName: plan.label,
      amountPaid: sub.amountPaid,
      status: isActive ? 'active' : 'expired',
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      daysLeft: isActive ? daysLeft : 0,
      isActive,
    }
  })

  const activeCount = subscriptionDetails.filter((s) => s.isActive).length
  const totalRevenue = subscriptionDetails.reduce((sum, s) => sum + s.amountPaid, 0)
  const expiredCount = subscriptionDetails.filter((s) => !s.isActive).length
  const expiringCount = subscriptionDetails.filter((s) => s.isActive && s.daysLeft <= 7).length

  function createSubscription() {
    if (!createForm.vendorId) {
      toast.warning('Please select a vendor')
      return
    }
    try {
      vendorSubscriptionData.subscribe(createForm.vendorId, createForm.plan, createForm.paymentMethod)
      toast.success('Subscription created')
      setCreateForm({ vendorId: '', plan: 'monthly', paymentMethod: 'card' })
      notifyLocalDataChange()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create subscription')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Vendor Subscriptions</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Expiring (7 days)</p>
          <p className="text-2xl font-bold text-yellow-600">{expiringCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Expired</p>
          <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
        </div>
      </div>

      {/* Create Subscription Form */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold mb-4">Create New Subscription</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={createForm.vendorId}
            onChange={(e) => setCreateForm({ ...createForm, vendorId: e.target.value })}
            className="input-field flex-1"
          >
            <option value="">Select a vendor...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.storeName}
              </option>
            ))}
          </select>
          <select
            value={createForm.plan}
            onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value as any })}
            className="input-field"
          >
            <option value="monthly">Monthly - {formatCurrency(getFeaturedListingPlan('monthly').priceKes)}</option>
            <option value="quarterly">Quarterly - {formatCurrency(getFeaturedListingPlan('quarterly').priceKes)}</option>
            <option value="biannual">Biannual - {formatCurrency(getFeaturedListingPlan('biannual').priceKes)}</option>
            <option value="yearly">Yearly - {formatCurrency(getFeaturedListingPlan('yearly').priceKes)}</option>
          </select>
          <button className="btn-primary" onClick={createSubscription}>
            Create
          </button>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-3">
        {subscriptionDetails.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            <p>No vendor subscriptions yet</p>
          </div>
        ) : (
          subscriptionDetails.map((sub) => {
            const plan = getFeaturedListingPlan(sub.plan)
            return (
              <div key={sub.id} className="card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {sub.vendorLogo && (
                      <Image
                        src={sub.vendorLogo}
                        alt={sub.vendorName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm">{sub.vendorName}</h3>
                      <p className="text-xs text-gray-500">{sub.planName} Plan</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Amount Paid</p>
                      <p className="font-semibold">{formatCurrency(sub.amountPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Started</p>
                      <p className="text-xs">{formatDate(sub.startedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expires</p>
                      <p className="text-xs">{formatDate(sub.expiresAt)}</p>
                    </div>
                    <div className="flex items-end gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <StatusBadge status={sub.status} />
                      </div>
                    </div>
                  </div>
                </div>

                {sub.isActive && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Days Remaining</p>
                        <p className={`font-semibold ${sub.daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {sub.daysLeft} days
                        </p>
                      </div>
                      {sub.daysLeft <= 7 && (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                          Expiring soon
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
