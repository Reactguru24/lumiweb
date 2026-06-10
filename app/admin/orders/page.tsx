'use client'

import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderApi } from '@/lib/api/services'
import { formatCurrency, formatDate } from '@/lib/utils/storage'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/common/Pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import type { OrderStatus } from '@/lib/types'

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const { data: orders, isLoading } = useQuery({ queryKey: ['admin-orders'], queryFn: orderApi.getAll })
  const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(orders, 10)

  async function updateStatus(id: string, status: OrderStatus) {
    await orderApi.updateStatus(id, status)
    toast.success(`Order ${status}`)
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Order Monitoring</h1>
      {isLoading ? <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-24" />)}</div>
        : (
          <>
            <div className="space-y-4">
              {paginated.map((order) => (
                <div key={order.id} className="card p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="min-w-0"><p className="font-medium text-sm">#{order.id.slice(-8)}</p><p className="text-xs text-gray-500 truncate">{formatDate(order.createdAt)} · {order.paymentMethod}</p></div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0"><StatusBadge status={order.status} /><p className="font-semibold">{formatCurrency(order.total)}</p></div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto mb-3">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2 shrink-0 text-sm">
                        <Image src={item.productImage} alt={item.productName} width={32} height={40} className="w-8 h-10 object-cover" />
                        <span>{item.productName} ×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 w-full sm:w-auto">Update:</span>
                    {statuses.map((s) => <button key={s} className={`px-2 py-1 text-xs border capitalize shrink-0 ${order.status === s ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : ''}`} onClick={() => updateStatus(order.id, s)}>{s}</button>)}
                  </div>
                </div>
              ))}
            </div>
            {total > 0 && <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goTo} />}
          </>
        )}
    </div>
  )
}
