'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vendorApplicationApi, vendorApi } from '@/lib/api/services'
import { formatDate } from '@/lib/utils/storage'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ResponsiveDataTable } from '@/components/common/ResponsiveDataTable'

export default function AdminVendorsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'applications' | 'vendors'>('applications')
  const [reviewNote, setReviewNote] = useState('')
  const { data: applications } = useQuery({ queryKey: ['vendor-apps'], queryFn: vendorApplicationApi.getAll })
  const { data: vendors } = useQuery({ queryKey: ['admin-vendors'], queryFn: vendorApi.getAll })

  const vendorTableData = vendors?.map((v) => ({ id: v.id, storeName: v.storeName, logo: v.logo, location: `${v.city}, ${v.country}`, productCount: v.productCount, rating: v.rating })) ?? []

  async function approve(id: string) {
    await vendorApplicationApi.approve(id)
    toast.success('Vendor approved')
    queryClient.invalidateQueries({ queryKey: ['vendor-apps'] })
    queryClient.invalidateQueries({ queryKey: ['admin-vendors'] })
  }

  async function reject(id: string) {
    await vendorApplicationApi.reject(id, reviewNote || 'Application rejected')
    toast.success('Application rejected')
    setReviewNote('')
    queryClient.invalidateQueries({ queryKey: ['vendor-apps'] })
  }

  async function suspend(id: string) {
    await vendorApi.suspend(id)
    toast.success('Vendor suspended')
    queryClient.invalidateQueries({ queryKey: ['admin-vendors'] })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Vendor Management</h1>
      <div className="flex gap-2 mb-6">
        <button className={`px-4 py-2 text-sm rounded-lg ${tab === 'applications' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`} onClick={() => setTab('applications')}>Applications</button>
        <button className={`px-4 py-2 text-sm rounded-lg ${tab === 'vendors' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`} onClick={() => setTab('vendors')}>Active Vendors</button>
      </div>
      {tab === 'applications' ? (
        <div className="space-y-4">
          {applications?.map((app) => (
            <div key={app.id} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Image src={app.logo} alt={app.storeName} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                  <div><h3 className="font-semibold">{app.storeName}</h3><p className="text-sm text-gray-500">{app.businessEmail} · {app.city}, {app.country}</p></div>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{app.businessDescription}</p>
              <div className="flex flex-wrap gap-2 mb-3">{app.categories.map((cat) => <span key={cat} className="badge bg-gray-100 dark:bg-gray-800">{cat}</span>)}</div>
              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <p>Registration: {app.registrationNumber}</p>
                <p>Risk Status: <span className="capitalize font-medium">{app.riskStatus}</span></p>
                <p>Submitted: {formatDate(app.submittedAt)}</p>
              </div>
              {app.status === 'pending' && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Review note (optional)" className="input-field text-sm py-2 flex-1 min-w-0" />
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-primary text-sm py-2 flex-1 sm:flex-none" onClick={() => approve(app.id)}>Approve</button>
                    <button className="btn-secondary text-sm py-2 text-red-600 border-red-600 flex-1 sm:flex-none" onClick={() => reject(app.id)}>Reject</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <ResponsiveDataTable
          columns={[{ key: 'storeName', label: 'Store', width: '30%' }, { key: 'location', label: 'Location', width: '25%' }, { key: 'productCount', label: 'Products', width: '15%' }, { key: 'rating', label: 'Rating', width: '15%' }]}
          rows={vendorTableData}
          renderCell={(key, row) => {
            if (key === 'storeName') return <div className="flex items-center gap-3"><Image src={row.logo as string} alt={row.storeName as string} width={32} height={32} className="w-8 h-8 rounded-full object-cover" /><span className="font-medium">{row.storeName as string}</span></div>
            if (key === 'rating') return <span>★ {row.rating as number}</span>
            return undefined
          }}
          renderActions={(row) => <button className="text-xs text-red-600 hover:text-red-700" onClick={() => suspend(row.id)}>Suspend</button>}
        />
      )}
    </div>
  )
}
