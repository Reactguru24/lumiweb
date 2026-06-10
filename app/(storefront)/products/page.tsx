'use client'

import { Suspense, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocalData } from '@/lib/data/hooks'
import { productData, vendorData } from '@/lib/data/services'
import type { ProductFilters } from '@/lib/types'
import { filtersFromQuery, filtersEqual, queryFromFilters, pageTitleFromFilters } from '@/lib/utils/productFilters'
import { usePagination } from '@/lib/hooks/usePagination'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFiltersPanel } from '@/components/product/ProductFiltersPanel'
import { Pagination } from '@/components/common/Pagination'
import { MobileDrawer } from '@/components/common/MobileDrawer'
import { Squares2X2Icon, ListBulletIcon, FunnelIcon } from '@heroicons/react/24/outline'

const brands = ['Sol Generation', 'Vivo Activewear', 'Nike', 'Adidas', "Levi's", 'H&M', 'Zara', 'Suave Kenya']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = ['Black', 'White', 'Navy', 'Grey', 'Beige', 'Red', 'Blue']

function productsHref(filters: ProductFilters, page: number): string {
  const nextQuery = new URLSearchParams(queryFromFilters(filters, page)).toString()
  return nextQuery ? `/products?${nextQuery}` : '/products'
}

function ProductsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const syncingFromRoute = useRef(false)

  const queryString = searchParams.toString()
  const queryObj = useMemo(() => Object.fromEntries(searchParams.entries()), [queryString])
  const [filters, setFilters] = useState<ProductFilters>(() => filtersFromQuery(queryObj))
  const [listView, setListView] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const products = useLocalData(() => productData.getAll(filters))

  const { page, totalPages, paginated, total, goTo, reset, pageSize } = usePagination(products, 12)
  const pageTitle = pageTitleFromFilters(filters)
  const vendors = useLocalData(() => vendorData.getAll())

  const syncRoute = useCallback((nextFilters: ProductFilters, nextPage: number) => {
    router.replace(productsHref(nextFilters, nextPage), { scroll: false })
  }, [router])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.subcategory) count++
    if (filters.gender) count++
    if (filters.brand) count++
    if (filters.size) count++
    if (filters.color) count++
    if (filters.vendorId) count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.minRating) count++
    if (filters.featured) count++
    if (filters.trending) count++
    if (filters.onSale) count++
    if (filters.search) count++
    return count
  }, [filters])

  useEffect(() => {
    syncingFromRoute.current = true
    const nextFilters = filtersFromQuery(queryObj)
    setFilters((prev) => (filtersEqual(prev, nextFilters) ? prev : nextFilters))
    goTo(queryObj.page ? Number(queryObj.page) : 1)
    queueMicrotask(() => { syncingFromRoute.current = false })
  }, [queryString, queryObj, goTo])

  function updateFilters(next: ProductFilters) {
    setFilters(next)
    reset()
    syncRoute(next, 1)
  }

  function handlePageChange(nextPage: number) {
    goTo(nextPage)
    syncRoute(filters, nextPage)
  }

  function clearFilters() {
    updateFilters({ sort: 'newest' })
    setShowFilters(false)
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="section-title truncate">{pageTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{total} products</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" className="md:hidden relative inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium" onClick={() => setShowFilters(true)}>
            <FunnelIcon className="w-4 h-4" />Filters
            {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-orange text-white text-[10px] rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <button type="button" className={`p-2 border border-gray-300 dark:border-gray-700 ${!listView ? 'bg-brand-teal text-white dark:bg-brand-orange' : ''}`} onClick={() => setListView(false)}><Squares2X2Icon className="w-5 h-5" /></button>
          <button type="button" className={`p-2 border border-gray-300 dark:border-gray-700 ${listView ? 'bg-brand-teal text-white dark:bg-brand-orange' : ''}`} onClick={() => setListView(true)}><ListBulletIcon className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <aside className="hidden md:block w-64 lg:w-72 shrink-0">
          <div className="sticky top-24 space-y-6 card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Filters</h2>
              <button type="button" className="text-xs text-gray-500 hover:underline" onClick={clearFilters}>Clear</button>
            </div>
            <ProductFiltersPanel filters={filters} onChange={updateFilters} vendors={vendors} brands={brands} sizes={sizes} colors={colors} onClear={clearFilters} />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {paginated.length ? (
            <div className={listView ? 'space-y-4' : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6'}>
              {paginated.map((p) => <ProductCard key={p.id} product={p} listView={listView} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 px-4">No products found. Try adjusting your filters.</div>
          )}
          {total > 0 && <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={handlePageChange} />}
        </div>
      </div>
      <MobileDrawer open={showFilters} onOpenChange={setShowFilters} title="Filter Products" footer={
        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1 text-sm py-3" onClick={clearFilters}>Clear</button>
          <button type="button" className="btn-primary flex-1 text-sm py-3" onClick={() => setShowFilters(false)}>Show {total} Results</button>
        </div>
      }>
        <ProductFiltersPanel filters={filters} onChange={updateFilters} vendors={vendors} brands={brands} sizes={sizes} colors={colors} onClear={clearFilters} />
      </MobileDrawer>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  )
}
