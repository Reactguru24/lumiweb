'use client'

import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productApi } from '@/lib/api/services'
import { formatCurrency } from '@/lib/utils/storage'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ResponsiveDataTable } from '@/components/common/ResponsiveDataTable'
import { Pagination } from '@/components/common/Pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import type { ProductStatus } from '@/lib/types'

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const { data: products, isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: () => productApi.getAll({ status: undefined }) })
  const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(products, 15)
  const tableData = paginated.map((p) => ({ id: p.id, name: p.name, image: p.images[0], brand: p.brand, price: p.price, status: p.status }))

  async function moderate(id: string, status: ProductStatus) {
    await productApi.moderate(id, status)
    toast.success(`Product ${status}`)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Product Moderation</h1>
      {isLoading ? <div className="space-y-3">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="skeleton h-14" />)}</div> : (
        <>
          <ResponsiveDataTable
            columns={[{ key: 'name', label: 'Product', width: '40%' }, { key: 'brand', label: 'Brand', width: '20%' }, { key: 'price', label: 'Price', width: '20%', format: (v) => formatCurrency(v as number) }, { key: 'status', label: 'Status', width: '20%' }]}
            rows={tableData}
            renderCell={(key, row) => {
              if (key === 'name') return <div className="flex items-center gap-3"><Image src={row.image as string} alt={row.name as string} width={40} height={48} className="w-10 h-12 object-cover rounded" /><span className="font-medium">{row.name as string}</span></div>
              if (key === 'status') return <StatusBadge status={row.status as string} />
              return undefined
            }}
            renderActions={(row) => (
              <>
                {row.status === 'pending' && <button className="text-xs text-green-600 hover:text-green-700" onClick={() => moderate(row.id, 'active')}>Approve</button>}
                {row.status === 'active' && <button className="text-xs text-yellow-600 hover:text-yellow-700" onClick={() => moderate(row.id, 'hidden')}>Hide</button>}
                <button className="text-xs text-red-600 hover:text-red-700" onClick={() => moderate(row.id, 'archived')}>Remove</button>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goTo} />
        </>
      )}
    </div>
  )
}
