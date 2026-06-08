import type { ProductFilters, Gender } from '@/types'
import type { LocationQuery } from 'vue-router'

export function filtersFromQuery(query: LocationQuery): ProductFilters {
  const bool = (key: string) => query[key] === 'true'
  const num = (key: string) => {
    const v = query[key]
    return v ? Number(v) : undefined
  }
  const str = (key: string) => (query[key] as string) || undefined

  return {
    search: str('search') || '',
    category: str('category') || '',
    subcategory: str('subcategory') || '',
    gender: str('gender') as Gender | undefined,
    brand: str('brand') || '',
    vendorId: str('vendorId') || '',
    size: str('size') || '',
    color: str('color') || '',
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    minRating: num('minRating'),
    featured: bool('featured') || undefined,
    trending: bool('trending') || undefined,
    onSale: bool('onSale') || undefined,
    sort: (str('sort') as ProductFilters['sort']) || 'newest',
  }
}

export function queryFromFilters(filters: ProductFilters, page?: number): Record<string, string> {
  const query: Record<string, string> = {}
  if (filters.search) query.search = filters.search
  if (filters.category) query.category = filters.category
  if (filters.subcategory) query.subcategory = filters.subcategory
  if (filters.gender) query.gender = filters.gender
  if (filters.brand) query.brand = filters.brand
  if (filters.vendorId) query.vendorId = filters.vendorId
  if (filters.size) query.size = filters.size
  if (filters.color) query.color = filters.color
  if (filters.minPrice !== undefined) query.minPrice = String(filters.minPrice)
  if (filters.maxPrice !== undefined) query.maxPrice = String(filters.maxPrice)
  if (filters.minRating !== undefined) query.minRating = String(filters.minRating)
  if (filters.featured) query.featured = 'true'
  if (filters.trending) query.trending = 'true'
  if (filters.onSale) query.onSale = 'true'
  if (filters.sort && filters.sort !== 'newest') query.sort = filters.sort
  if (page && page > 1) query.page = String(page)
  return query
}

export function pageTitleFromFilters(filters: ProductFilters): string {
  if (filters.onSale) return 'Sale'
  if (filters.trending) return 'Trending'
  if (filters.featured) return 'Featured'
  if (filters.subcategory) return filters.subcategory
  if (filters.category) {
    const map: Record<string, string> = {
      men: "Men's Fashion",
      women: "Women's Fashion",
      kids: 'Kids',
      accessories: 'Accessories',
      footwear: 'Footwear',
    }
    return map[filters.category] || 'Shop All'
  }
  if (filters.search) return `Search: ${filters.search}`
  if (filters.sort === 'newest') return 'New Arrivals'
  return 'Shop All'
}
