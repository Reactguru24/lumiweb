'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { loginSchema } from '@/lib/utils/validation'
import { RouteGuard } from '@/components/layouts/RouteGuard'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const next: Record<string, string> = {}
      result.error.issues.forEach((i) => { next[i.path[0] as string] = i.message })
      setErrors(next)
      return
    }
    try {
      await auth.login(form.email, form.password)
      toast.success('Welcome back!')
      const redirect = searchParams.get('redirect')
      router.push(redirect || auth.getDashboardRoute())
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <RouteGuard guest>
      <div>
        <h1 className="font-display text-3xl font-semibold mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">Sign in to your account</p>
        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="input-field" placeholder="you@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="input-field" placeholder="••••••••" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={auth.loading}>
            {auth.loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-gray-900 dark:text-white font-medium hover:underline">Register</Link>
        </p>
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700 dark:text-gray-300">Demo Accounts:</p>
          <p>Admin: admin@lumiafrica.com / admin123</p>
          <p>Customer: customer@lumiafrica.com / customer123</p>
          <p>Vendor: vendor@lumiafrica.com / vendor123</p>
        </div>
      </div>
    </RouteGuard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="skeleton h-64 w-full" />}>
      <LoginForm />
    </Suspense>
  )
}
