'use client'

import { useState } from 'react'
import { useLocalData } from '@/lib/data/hooks'
import { notifyLocalDataChange } from '@/lib/data/events'
import { toast } from 'sonner'
import { userData } from '@/lib/data/services'
import { formatDate } from '@/lib/utils/storage'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { usePagination } from '@/lib/hooks/usePagination'
import { Pagination } from '@/components/common/Pagination'
import { ResponsiveDataTable } from '@/components/common/ResponsiveDataTable'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const users = useLocalData(() => userData.getAll())

  const filtered = search ? users.filter((u) => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) : users
  const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(filtered, 15)
  const tableData = paginated.map((user) => ({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, createdAt: user.createdAt, disabled: user.disabled }))

  function disableUser(id: string) {
    userData.disable(id)
    toast.success('Account disabled')
    notifyLocalDataChange()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">User Management</h1>
        <div className="relative w-full sm:w-auto">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-10 py-2 text-sm w-full sm:w-64" />
        </div>
      </div>
      <>
          <ResponsiveDataTable
            columns={[{ key: 'fullName', label: 'Name', width: '25%' }, { key: 'email', label: 'Email', width: '30%' }, { key: 'role', label: 'Role', width: '15%' }, { key: 'createdAt', label: 'Joined', width: '20%', format: (v) => formatDate(v as string) }, { key: 'disabled', label: 'Status', width: '10%', format: (v) => v ? 'Disabled' : 'Active' }]}
            rows={tableData}
            renderCell={(key, row) => key === 'role' ? <span className="badge bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{row.role as string}</span> : undefined}
            renderActions={(row) => !row.disabled && row.role !== 'ADMIN' ? <button className="text-xs text-red-600 hover:text-red-700" onClick={() => disableUser(row.id)}>Disable</button> : null}
          />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goTo} />
      </>
    </div>
  )
}
