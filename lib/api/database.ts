import type { AppData } from '@/lib/types'
import { generateSeedData } from '@/lib/data/seed'
import { getAppDataKey, getStorage, setStorage } from '@/lib/utils/storage'
import { categoryClothingImage, storeLogoImage, storeBannerImage } from '@/lib/utils/images'

const DATA_VERSION = 2
const VERSION_KEY = 'lumi_data_version'

let cache: AppData | null = null

function needsImageMigration(url: string): boolean {
  return url.includes('picsum.photos')
}

function migrateImages(data: AppData): AppData {
  data.vendors.forEach((v, i) => {
    if (needsImageMigration(v.logo)) v.logo = storeLogoImage(i)
    if (needsImageMigration(v.banner)) v.banner = storeBannerImage(i)
  })
  data.products.forEach((p, i) => {
    p.images = p.images.map((img, j) =>
      needsImageMigration(img) ? categoryClothingImage(p.category, i * 5 + j) : img
    )
  })
  data.vendorApplications.forEach((a, i) => {
    if (needsImageMigration(a.logo)) a.logo = storeLogoImage(i + 10)
  })
  return data
}

export function getDatabase(): AppData {
  if (cache) return cache

  const version = getStorage<number>(VERSION_KEY, 0)
  let stored = getStorage<AppData | null>(getAppDataKey(), null)
  if (!stored) {
    stored = getStorage<AppData | null>('luxe_marketplace_data', null)
  }

  if (stored && version < DATA_VERSION) {
    stored = migrateImages(stored)
    setStorage(VERSION_KEY, DATA_VERSION)
    cache = stored
    persist()
    return cache
  }

  if (stored) {
    cache = stored
    return cache
  }

  cache = generateSeedData()
  setStorage(VERSION_KEY, DATA_VERSION)
  persist()
  return cache
}

export function persist(): void {
  if (cache) setStorage(getAppDataKey(), cache)
}

export function resetDatabase(): void {
  cache = generateSeedData()
  setStorage(VERSION_KEY, DATA_VERSION)
  persist()
}
