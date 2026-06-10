'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorApplicationData } from '@/lib/data/services'
import { vendorApplicationSchema } from '@/lib/utils/validation'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { VendorApplication } from '@/lib/types'

const categories = ["Men's Wear", "Women's Wear", 'Streetwear', 'Sportswear', 'Luxury Fashion', 'Accessories']

export default function VendorApplicationPage() {
  const auth = useAuthStore()
  const [existing, setExisting] = useState<VendorApplication | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    storeName: '',
    businessDescription: '',
    logo: 'https://images.unsplash.com/photo-1441984904996-e0b495a9b1da?w=100&h=100&fit=crop&q=80',
    contactPhone: auth.user?.phone || '',
    businessEmail: '',
    country: '',
    city: '',
    socialLinks: { instagram: '', twitter: '' },
    registrationNumber: '',
    categories: [] as string[],
  })

  useEffect(() => {
    if (auth.user) setExisting(vendorApplicationData.getByUserId(auth.user.id))
  }, [auth.user])

  function toggleCategory(cat: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat],
    }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const result = vendorApplicationSchema(auth.user?.email).safeParse(form)
    if (!result.success) {
      const next: Record<string, string> = {}
      result.error.issues.forEach((i) => { next[i.path[0] as string] = i.message })
      setErrors(next)
      return
    }
    try {
      vendorApplicationData.submit(auth.user!.id, form)
      setExisting(vendorApplicationData.getByUserId(auth.user!.id))
      toast.success('Application submitted!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Submission failed')
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Customer and vendor accounts are separate. Use a <strong>business email</strong> that is not{' '}
        <strong>{auth.user?.email}</strong>. If approved, you will sign out and sign in with that vendor email to access the seller dashboard.
      </p>

      {existing && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold mb-4">Application Status</h2>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={existing.status} />
            <span className="text-sm text-gray-500">Submitted {new Date(existing.submittedAt).toLocaleDateString()}</span>
          </div>
          {existing.reviewNote && <p className="text-sm text-gray-500 mt-2">{existing.reviewNote}</p>}
          {existing.status === 'approved' && (
            <p className="text-sm text-green-600 mt-2">
              Your vendor login is <strong>{existing.businessEmail}</strong>. Sign out of this customer account, then sign in with your vendor email.
            </p>
          )}
        </div>
      )}
      {(!existing || existing.status === 'rejected') && (
        <form className="space-y-6" onSubmit={submit}>
          <h2 className="font-semibold">Vendor Application</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Store Name</label><input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input-field mt-1" />{errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>}</div>
            <div>
              <label className="text-sm font-medium">Business Email</label>
              <input value={form.businessEmail} onChange={(e) => setForm({ ...form, businessEmail: e.target.value })} type="email" placeholder="store@yourbusiness.com" className="input-field mt-1" />
              {errors.businessEmail && <p className="text-red-500 text-xs mt-1">{errors.businessEmail}</p>}
              <p className="text-xs text-gray-500 mt-1">Must be different from your customer email ({auth.user?.email})</p>
            </div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Business Description</label><textarea value={form.businessDescription} onChange={(e) => setForm({ ...form, businessDescription: e.target.value })} rows={3} className="input-field mt-1" />{errors.businessDescription && <p className="text-red-500 text-xs mt-1">{errors.businessDescription}</p>}</div>
            <div><label className="text-sm font-medium">Contact Phone</label><input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">Registration Number</label><input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field mt-1" /></div>
            <div><label className="text-sm font-medium">City</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field mt-1" /></div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Logo Upload (Mock)</label>
            <div className="flex items-center gap-4">
              <Image src={form.logo} alt="Logo" width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
              <button type="button" className="btn-secondary text-sm py-2" onClick={() => { setForm({ ...form, logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&q=80' }); toast.info('Logo uploaded (mock)') }}>Upload Logo</button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Clothing Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} type="button" className={`px-3 py-1.5 text-sm border transition-colors ${form.categories.includes(cat) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border-gray-300 dark:border-gray-700'}`} onClick={() => toggleCategory(cat)}>{cat}</button>
              ))}
            </div>
            {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}
          </div>
          <button type="submit" className="btn-primary">Submit Application</button>
        </form>
      )}
    </div>
  )
}
