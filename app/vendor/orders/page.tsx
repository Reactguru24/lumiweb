'use client'

import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorApi, orderApi } from '@/lib/api/services'
import { formatCurrency, formatDate } from '@/lib/utils/storage'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/common/Pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import type { OrderStatus } from '@/lib/types'

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

export default function VendorOrdersPage() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()
  const { data: vendor } = useQuery({ queryKey: ['my-vendor', auth.user?.id], queryFn: () => vendorApi.getByUserId(auth.user!.id) })
  const { data: orders, isLoading } = useQuery({ queryKey: ['vendor-orders', vendor?.id], queryFn: () => orderApi.getByVendor(vendor!.id), enabled: !!vendor?.id })
  const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(orders, 8)

  async function updateStatus(orderId: string, status: OrderStatus) {
    await orderApi.updateStatus(orderId, status)
    toast.success(`Order updated to ${status}`)
    queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      {isLoading ? <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-24" />)}</div>
        : orders?.length ? (
          <>
            <div className="space-y-4">
              {paginated.map((order) => (
                <div key={order.id} className="card p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div><p className="font-medium text-sm">#{order.id.slice(-8)}</p><p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p></div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="space-y-2">
                    {order.items.filter((i) => i.vendorId === vendor?.id).map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 text-sm">
                        <Image src={item.productImage} alt={item.productName} width={40} height={48} className="w-10 h-12 object-cover" />
                        <div className="flex-1"><p>{item.productName}</p><p className="text-gray-500">Qty: {item.quantity} · {item.size} · {item.color}</p></div>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-xs text-gray-500 w-full sm:w-auto sm:mr-auto">Update status:</span>
                    {statuses.map((s) => <button key={s} className={`px-2 py-1 text-xs border capitalize shrink-0 ${order.status === s ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : ''}`} onClick={() => updateStatus(order.id, s)}>{s}</button>)}
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goTo} />
          </>
        ) : <p className="text-gray-500 text-center py-12">No orders yet.</p>}
    </div>
  )
}
