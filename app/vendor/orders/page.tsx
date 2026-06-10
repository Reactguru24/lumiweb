'use client'

import Image from 'next/image'
import { useLocalData } from '@/lib/data/hooks'
import { notifyLocalDataChange } from '@/lib/data/events'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorData, orderData } from '@/lib/data/services'
import { formatCurrency, formatDate } from '@/lib/utils/storage'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/common/Pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import type { OrderStatus } from '@/lib/types'

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

export default function VendorOrdersPage() {
  const isHydrated = useHydration()
  const auth = useAuthStore()
  const vendor = useLocalData(() => auth.user ? vendorData.getByUserId(auth.user.id) : null)
  const orders = useLocalData(() => vendor ? orderData.getByVendor(vendor.id) : [])
  const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(orders, 8)

  function updateStatus(orderId: string, status: OrderStatus) {
    orderData.updateStatus(orderId, status)
    toast.success(`Order updated to ${status}`)
    notifyLocalDataChange()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      {orders.length ? (
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
