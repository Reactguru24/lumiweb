'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLocalData } from '@/lib/data/hooks'
import { notifyLocalDataChange } from '@/lib/data/events'
import { toast } from 'sonner'
import { orderData } from '@/lib/data/services'
import { formatCurrency, formatDate } from '@/lib/utils/storage'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/common/Pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import type { OrderStatus } from '@/lib/types'

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const orders = useLocalData(() => orderData.getAll())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(filteredOrders, 10)

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
  }

  function updateStatus(id: string, status: OrderStatus) {
    orderData.updateStatus(id, status)
    toast.success(`Order status updated to ${status}`)
    notifyLocalDataChange()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and track all customer orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">All time</p>
        </div>

        <div className="card p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Awaiting action</p>
        </div>

        <div className="card p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">In Transit</p>
          <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Being shipped</p>
        </div>

        <div className="card p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">From all orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                goTo(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <button
              onClick={() => {
                setSelectedStatus('all')
                goTo(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status)
                  goTo(1)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card border border-gray-200 dark:border-gray-700 overflow-hidden">
        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.paymentMethod}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.productId} className="relative w-10 h-12 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                              <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                              {item.quantity > 1 && <span className="absolute bottom-0 right-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-1 rounded-tl">×{item.quantity}</span>}
                            </div>
                          ))}
                          {order.items.length > 2 && <div className="w-10 h-12 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">+{order.items.length - 2}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {statuses.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${
                                order.status === s
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {s.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goTo} />
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No orders found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
