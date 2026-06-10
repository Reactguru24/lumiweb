'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorApi } from '@/lib/api/services'

export default function VendorProfilePage() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()
  const { data: vendor } = useQuery({ queryKey: ['my-vendor', auth.user?.id], queryFn: () => vendorApi.getByUserId(auth.user!.id) })
  const [form, setForm] = useState({ storeName: '', description: '', contactPhone: '', businessEmail: '', country: '', city: '', socialLinks: { instagram: '', twitter: '' }, logo: '', banner: '' })

  useEffect(() => {
    if (vendor) setForm({
      storeName: vendor.storeName, description: vendor.description, contactPhone: vendor.contactPhone,
      businessEmail: vendor.businessEmail, country: vendor.country, city: vendor.city,
      socialLinks: { instagram: vendor.socialLinks.instagram || '', twitter: vendor.socialLinks.twitter || '' },
      logo: vendor.logo, banner: vendor.banner,
    })
  }, [vendor])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!vendor) return
    await vendorApi.update(vendor.id, form)
    queryClient.invalidateQueries({ queryKey: ['my-vendor'] })
    toast.success('Store profile updated')
  }

  function mockUpload(field: 'logo' | 'banner') {
    setForm({ ...form, [field]: field === 'logo' ? 'https://images.unsplash.com/photo-1441984904996-e0b495a9b1da?w=100&h=100&fit=crop&q=80' : 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop&q=80' })
    toast.info(`${field} uploaded (mock)`)
  }

  if (!vendor) return null

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Store Settings</h1>
      <form className="card p-6 space-y-6 max-w-2xl" onSubmit={save}>
        <div className="flex items-center gap-4">
          <Image src={form.logo} alt="Logo" width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
          <button type="button" className="btn-secondary text-sm py-2" onClick={() => mockUpload('logo')}>Change Logo</button>
        </div>
        <div>
          <Image src={form.banner} alt="Banner" width={800} height={128} className="w-full h-32 object-cover" />
          <button type="button" className="btn-secondary text-sm py-2 mt-2" onClick={() => mockUpload('banner')}>Change Banner</button>
        </div>
        <div><label className="text-sm font-medium">Store Name</label><input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input-field mt-1" /></div>
        <div><label className="text-sm font-medium">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input-field mt-1" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Phone</label><input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input-field mt-1" /></div>
          <div><label className="text-sm font-medium">Email</label><input value={form.businessEmail} onChange={(e) => setForm({ ...form, businessEmail: e.target.value })} className="input-field mt-1" /></div>
          <div><label className="text-sm font-medium">Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field mt-1" /></div>
          <div><label className="text-sm font-medium">City</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field mt-1" /></div>
          <div><label className="text-sm font-medium">Instagram</label><input value={form.socialLinks.instagram} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })} className="input-field mt-1" /></div>
          <div><label className="text-sm font-medium">Twitter</label><input value={form.socialLinks.twitter} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })} className="input-field mt-1" /></div>
        </div>
        <button type="submit" className="btn-primary">Save Settings</button>
      </form>
    </div>
  )
}
