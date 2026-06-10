'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/lib/stores/auth'

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function UserMenu() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const getDashboardRoute = useAuthStore((s) => s.getDashboardRoute)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!user) return null

  const initials = getInitials(user.fullName)
  const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase()

  async function handleLogout() {
    setOpen(false)
    await logout()
    router.push('/')
  }

  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="w-8 h-8 rounded-full bg-brand-teal dark:bg-brand-orange text-white text-xs font-semibold flex items-center justify-center">
          {initials}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 card shadow-xl p-2 z-50 animate-fade-in">
          <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-brand-teal dark:bg-brand-orange text-white text-sm font-semibold flex items-center justify-center shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">Signed in · {roleLabel}</p>
          </div>

          <div className="py-1">
            {user.role === 'CUSTOMER' && (
              <>
                <Link href="/account" className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" onClick={() => setOpen(false)}>My Account</Link>
                <Link href="/account/orders" className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" onClick={() => setOpen(false)}>My Orders</Link>
                <Link href="/account/wishlist" className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" onClick={() => setOpen(false)}>Wishlist</Link>
              </>
            )}
            {user.role !== 'CUSTOMER' && (
              <Link href={getDashboardRoute()} className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" onClick={() => setOpen(false)}>Dashboard</Link>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
