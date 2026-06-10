'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { userData } from '@/lib/data/services'

export default function AccountProfilePage() {
  const auth = useAuthStore()
  const [form, setForm] = useState({ fullName: auth.user?.fullName || '', email: auth.user?.email || '', phone: auth.user?.phone || '' })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirm: '' })

  async function saveProfile() {
    if (!auth.user) return
    await userData.update(auth.user.id, form)
    auth.refreshUser()
    toast.success('Profile updated')
  }

  async function changePassword() {
    if (passwordForm.newPassword !== passwordForm.confirm) { toast.error('Passwords do not match'); return }
    if (!auth.user) return
    await userData.update(auth.user.id, { password: passwordForm.newPassword })
    setPasswordForm({ newPassword: '', confirm: '' })
    toast.success('Password updated')
  }

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field mt-1" /></div>
          <div><label className="text-sm font-medium">Email</label><input value={form.email} type="email" className="input-field mt-1" disabled /></div>
          <div><label className="text-sm font-medium">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1" /></div>
        </div>
        <button className="btn-primary mt-4" onClick={saveProfile}>Save Changes</button>
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Password Settings</h2>
        <div className="space-y-4 max-w-md">
          <div><label className="text-sm font-medium">New Password</label><input value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} type="password" className="input-field mt-1" /></div>
          <div><label className="text-sm font-medium">Confirm Password</label><input value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} type="password" className="input-field mt-1" /></div>
        </div>
        <button className="btn-primary mt-4" onClick={changePassword}>Update Password</button>
      </div>
    </div>
  )
}
