import { useState, useMemo, useEffect, useCallback } from 'react'

export function usePagination<T>(items: T[] | undefined, pageSize = 12) {
  const [page, setPage] = useState(1)

  const total = items?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const paginated = useMemo(() => {
    if (!items) return []
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const goTo = useCallback((p: number) => {
    setPage((prev) => {
      const next = Math.min(Math.max(1, p), totalPages)
      return prev === next ? prev : next
    })
  }, [totalPages])

  const reset = useCallback(() => {
    setPage((prev) => (prev === 1 ? prev : 1))
  }, [])

  return { page, totalPages, paginated, total, goTo, reset, pageSize }
}
