'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLocalData } from '@/lib/data/hooks'
import { notifyLocalDataChange } from '@/lib/data/events'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorData, productData } from '@/lib/data/services'
import { formatCurrency } from '@/lib/utils/storage'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ResponsiveDataTable } from '@/components/common/ResponsiveDataTable'
import { Pagination } from '@/components/common/Pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { Product } from '@/lib/types'

export default function VendorProductsPage() {
  const auth = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', sku: '', category: 'men', subcategory: 'T-Shirts', brand: '', gender: 'men' as const, sizes: ['S', 'M', 'L'], price: 0, discount: 0, stock: 0 })

  const vendor = useLocalData(() => auth.user ? vendorData.getByUserId(auth.user.id) : null)
  const products = useLocalData(() => vendor ? productData.getAll({ vendorId: vendor.id, status: undefined }) : [])
  const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(products, 10)

  const tableData = paginated.map((p) => ({ id: p.id, name: p.name, image: p.images[0], sku: p.sku, price: p.price, stock: p.stock, status: p.status }))

  function resetForm() { setForm({ name: '', description: '', sku: '', category: 'men', subcategory: 'T-Shirts', brand: '', gender: 'men', sizes: ['S', 'M', 'L'], price: 0, discount: 0, stock: 0 }); setEditingId(null); setShowForm(false) }

  function editProduct(p: Product) {
    setEditingId(p.id)
    setForm({ name: p.name, description: p.description, sku: p.sku, category: p.category, subcategory: p.subcategory, brand: p.brand, gender: p.gender as 'men', sizes: p.sizes, price: p.price, discount: p.discount, stock: p.stock })
    setShowForm(true)
  }

  function saveProduct() {
    if (!vendor) return
    try {
      if (editingId) { productData.update(editingId, form); toast.success('Product updated') }
      else { productData.create(vendor.id, form); toast.success('Product created') }
      notifyLocalDataChange()
      resetForm()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Products</h1>
        <button className="btn-primary text-sm py-2 flex items-center justify-center gap-2 w-full sm:w-auto" onClick={() => { setShowForm(true); setEditingId(null) }}><PlusIcon className="w-4 h-4" /> Add Product</button>
      </div>
      {showForm && (
        <div className="card p-6 mb-6 animate-slide-up">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Product</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">Brand</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field mt-1"><option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option><option value="accessories">Accessories</option><option value="footwear">Footwear</option></select></div>
            <div><label className="text-sm font-medium">Subcategory</label><input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">Price</label><input value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} type="number" className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">Discount %</label><input value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} type="number" className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">Stock</label><input value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} type="number" className="input-field mt-1" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field mt-1" /></div>
          </div>
          <div className="flex gap-3 mt-4"><button className="btn-primary" onClick={saveProduct}>Save</button><button className="btn-secondary" onClick={resetForm}>Cancel</button></div>
        </div>
      )}
      <>
          <ResponsiveDataTable
            columns={[{ key: 'name', label: 'Product', width: '30%' }, { key: 'sku', label: 'SKU', width: '15%' }, { key: 'price', label: 'Price', width: '15%', format: (v) => formatCurrency(v as number) }, { key: 'stock', label: 'Stock', width: '15%' }, { key: 'status', label: 'Status', width: '15%' }]}
            rows={tableData}
            renderCell={(key, row) => {
              if (key === 'name') return <div className="flex items-center gap-3"><Image src={row.image as string} alt={row.name as string} width={40} height={48} className="w-10 h-12 object-cover rounded" /><span className="font-medium">{row.name as string}</span></div>
              if (key === 'status') return <StatusBadge status={row.status as string} />
              return undefined
            }}
            renderActions={(row) => (
              <>
                <button className="p-1 hover:text-blue-600" onClick={() => editProduct(products.find((p) => p.id === row.id)!)}><PencilIcon className="w-4 h-4" /></button>
                <button className="p-1 hover:text-yellow-600" onClick={() => { productData.update(row.id, { status: 'archived' }); toast.success('Product archived'); notifyLocalDataChange() }}><TrashIcon className="w-4 h-4" /></button>
                <button className="p-1 hover:text-red-600 text-xs" onClick={() => { productData.delete(row.id); toast.success('Product deleted'); notifyLocalDataChange() }}>Del</button>
              </>
            )}
          />
          {total > 0 && <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goTo} />}
      </>
    </div>
  )
}
