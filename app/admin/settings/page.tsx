'use client'

import { useState, useEffect } from 'react'
import { useLocalData } from '@/lib/data/hooks'
import { notifyLocalDataChange } from '@/lib/data/events'
import { toast } from 'sonner'
import { settingsData } from '@/lib/data/services'

export default function AdminSettingsPage() {
  const settings = useLocalData(() => settingsData.get())
  const [form, setForm] = useState({ taxRate: 0.08, categories: [] as string[], brands: [] as string[], newCategory: '', newBrand: '' })

  useEffect(() => {
    if (settings) setForm({ taxRate: settings.taxRate, categories: [...settings.categories], brands: [...settings.brands], newCategory: '', newBrand: '' })
  }, [settings])

  function save() {
    settingsData.update({ taxRate: form.taxRate, categories: form.categories, brands: form.brands })
    toast.success('Settings saved')
    notifyLocalDataChange()
  }

  function addCategory() {
    if (form.newCategory && !form.categories.includes(form.newCategory)) {
      setForm({ ...form, categories: [...form.categories, form.newCategory], newCategory: '' })
    }
  }

  function addBrand() {
    if (form.newBrand && !form.brands.includes(form.newBrand)) {
      setForm({ ...form, brands: [...form.brands, form.newBrand], newBrand: '' })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Platform Settings</h1>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Tax Settings</h2>
          <label className="text-sm font-medium">Tax Rate (%)</label>
          <input value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} type="number" step="0.01" className="input-field mt-1" />
          <p className="text-xs text-gray-500 mt-1">Current: {(form.taxRate * 100).toFixed(1)}%</p>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Shipping Methods</h2>
          {settings && <div className="space-y-2 text-sm">{settings.shippingMethods.map((method) => (
            <div key={method.id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800"><span>{method.name}</span><span className="text-gray-500">${method.price} · {method.days}</span></div>
          ))}</div>}
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.categories.slice(0, 10).map((cat) => <span key={cat} className="badge bg-gray-100 dark:bg-gray-800">{cat}</span>)}
            {form.categories.length > 10 && <span className="text-xs text-gray-500">+{form.categories.length - 10} more</span>}
          </div>
          <div className="flex gap-2">
            <input value={form.newCategory} onChange={(e) => setForm({ ...form, newCategory: e.target.value })} placeholder="New category" className="input-field text-sm py-2 flex-1" />
            <button className="btn-secondary text-sm py-2" onClick={addCategory}>Add</button>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Brands</h2>
          <div className="flex flex-wrap gap-2 mb-3">{form.brands.map((brand) => <span key={brand} className="badge bg-gray-100 dark:bg-gray-800">{brand}</span>)}</div>
          <div className="flex gap-2">
            <input value={form.newBrand} onChange={(e) => setForm({ ...form, newBrand: e.target.value })} placeholder="New brand" className="input-field text-sm py-2 flex-1" />
            <button className="btn-secondary text-sm py-2" onClick={addBrand}>Add</button>
          </div>
        </div>
        <div className="card p-6 md:col-span-2">
          <h2 className="font-semibold mb-4">Active Coupons</h2>
          {settings && <div className="grid md:grid-cols-3 gap-3">{settings.coupons.map((coupon) => (
            <div key={coupon.id} className="p-3 border border-gray-200 dark:border-gray-800 text-sm">
              <p className="font-mono font-bold">{coupon.code}</p>
              <p className="text-gray-500">{coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`} off · Min ${coupon.minOrder}</p>
            </div>
          ))}</div>}
        </div>
      </div>
      <button className="btn-primary mt-6" onClick={save}>Save Settings</button>
    </div>
  )
}
