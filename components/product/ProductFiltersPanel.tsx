'use client'

import type { ProductFilters, Vendor } from '@/lib/types'

interface ProductFiltersPanelProps {
  filters: ProductFilters
  onChange: (filters: ProductFilters) => void
  vendors?: Vendor[]
  brands: string[]
  sizes: string[]
  colors: string[]
  onClear?: () => void
}

export function ProductFiltersPanel({ filters, onChange, vendors, brands, sizes, colors, onClear }: ProductFiltersPanelProps) {
  const update = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-medium text-sm mb-2">Sort By</h3>
        <select value={filters.sort || 'newest'} className="input-field text-sm py-2.5" onChange={(e) => update({ sort: e.target.value as ProductFilters['sort'] })}>
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="rating">Best Rated</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Category</h3>
        <select value={filters.category || ''} className="input-field text-sm py-2.5" onChange={(e) => update({ category: e.target.value })}>
          <option value="">All</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
          <option value="accessories">Accessories</option>
          <option value="footwear">Footwear</option>
        </select>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Gender</h3>
        <select value={filters.gender || ''} className="input-field text-sm py-2.5" onChange={(e) => update({ gender: (e.target.value || undefined) as ProductFilters['gender'] })}>
          <option value="">All</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Brand</h3>
        <select value={filters.brand || ''} className="input-field text-sm py-2.5" onChange={(e) => update({ brand: e.target.value })}>
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              className={`min-w-[2.5rem] px-3 py-2 text-xs border transition-colors ${
                filters.size === s ? 'bg-brand-teal text-white dark:bg-brand-orange border-brand-teal dark:border-brand-orange' : 'border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => update({ size: filters.size === s ? '' : s })}
            >{s}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`px-3 py-2 text-xs border transition-colors ${
                filters.color === c ? 'bg-brand-teal text-white dark:bg-brand-orange border-brand-teal dark:border-brand-orange' : 'border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => update({ color: filters.color === c ? '' : c })}
            >{c}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Vendor</h3>
        <select value={filters.vendorId || ''} className="input-field text-sm py-2.5" onChange={(e) => update({ vendorId: e.target.value })}>
          <option value="">All Vendors</option>
          {vendors?.map((v) => <option key={v.id} value={v.id}>{v.storeName}</option>)}
        </select>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Price Range (KES)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Min" className="input-field text-sm py-2.5" value={filters.minPrice ?? ''} onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })} />
          <input type="number" placeholder="Max" className="input-field text-sm py-2.5" value={filters.maxPrice ?? ''} onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-2">Min Rating</h3>
        <select value={filters.minRating ?? ''} className="input-field text-sm py-2.5" onChange={(e) => update({ minRating: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">Any</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
      </div>
      {onClear && (
        <button type="button" className="btn-ghost text-sm w-full md:hidden" onClick={onClear}>Clear All Filters</button>
      )}
    </div>
  )
}
