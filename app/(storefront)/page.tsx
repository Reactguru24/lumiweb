'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { productApi, vendorApi } from '@/lib/api/services'
import { ProductCard } from '@/components/product/ProductCard'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { HeroSlider } from '@/components/common/HeroSlider'
import { heroImage } from '@/lib/utils/images'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const heroSlides = [
  { label: "Men's Collection", title: 'Sharp Style for Every Occasion', subtitle: 'From Nairobi boardrooms to weekend outings — discover premium menswear across East Africa.', image: heroImage('men'), link: '/products?category=men' },
  { label: "Women's Fashion", title: 'Elegant Looks, African Spirit', subtitle: 'Dresses, kitenge-inspired pieces, and contemporary fashion curated for the modern woman.', image: heroImage('women'), link: '/products?category=women' },
  { label: 'Kids & Teens', title: 'Growing Up in Style', subtitle: 'Comfortable, durable clothing for boys, girls, and teens — from playtime to school days.', image: heroImage('kids'), link: '/products?category=kids' },
  { label: 'Teen Streetwear', title: 'Bold Fits for Young Trendsetters', subtitle: "Streetwear and sportswear that keeps pace with Kenya's vibrant youth culture.", image: heroImage('teens'), link: '/products?search=streetwear' },
  { label: 'Footwear', title: 'Step Out in Confidence', subtitle: 'Sneakers, sandals, and boots from trusted vendors across the region.', image: heroImage('footwear'), link: '/products?category=footwear' },
  { label: 'Accessories', title: 'Complete Your Look', subtitle: 'Bags, belts, caps, and more — the finishing touches for every outfit.', image: heroImage('accessories'), link: '/products?category=accessories' },
]

const promos = [
  { title: 'Fast Shipping', desc: 'Reliable delivery across East Africa', icon: '🚚' },
  { title: 'M-Pesa & Cards', desc: 'Pay your way, securely', icon: '📱' },
  { title: 'Easy Returns', desc: '14-day return policy', icon: '↩️' },
  { title: 'Verified Vendors', desc: 'Trusted East African sellers', icon: '✓' },
]

export default function HomePage() {
  const { data: featured, isLoading: loadingFeatured } = useQuery({ queryKey: ['featured'], queryFn: productApi.getFeatured })
  const { data: trending, isLoading: loadingTrending } = useQuery({ queryKey: ['trending'], queryFn: productApi.getTrending })
  const { data: bestsellers, isLoading: loadingBest } = useQuery({ queryKey: ['bestsellers'], queryFn: productApi.getBestsellers })
  const { data: newArrivals, isLoading: loadingNew } = useQuery({ queryKey: ['newArrivals'], queryFn: productApi.getNewArrivals })
  const { data: topVendors } = useQuery({ queryKey: ['topVendors'], queryFn: () => vendorApi.getTop(6) })

  return (
    <div>
      <HeroSlider slides={heroSlides} />
      <section className="border-b border-gray-200 dark:border-gray-800 bg-brand-50 dark:bg-gray-900">
        <div className="page-width py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {promos.map((promo) => (
            <div key={promo.title} className="text-center">
              <span className="text-2xl mb-2 block">{promo.icon}</span>
              <h3 className="font-medium text-sm">{promo.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{promo.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="page-width py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="micro-label mb-1">Curated for you</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link href="/products?featured=true" className="flex items-center text-sm font-medium hover:underline text-brand-teal">
            View All <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {loadingFeatured ? <LoadingSkeleton /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
      <section className="bg-brand-teal text-white py-16">
        <div className="page-width grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div>
            <p className="micro-label !text-brand-orange mb-2">Made for East Africa</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">Fashion From Nairobi to Kampala</h2>
            <p className="text-brand-100 mb-6">Shop local brands and international labels from verified vendors across Kenya, Uganda, Tanzania, Rwanda, and Ethiopia.</p>
            <Link href="/products?trending=true" className="btn-primary bg-brand-orange border-brand-orange hover:bg-brand-orange/90">Explore Trends</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Image src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80" width={400} height={500} className="aspect-[4/5] object-cover w-full h-auto" alt="African fashion" />
            <Image src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80" width={400} height={500} className="aspect-[4/5] object-cover mt-6 w-full h-auto" alt="Women's dress" />
            <Image src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" width={400} height={500} className="aspect-[4/5] object-cover -mt-6 w-full h-auto" alt="T-shirt" />
            <Image src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80" width={400} height={500} className="aspect-[4/5] object-cover w-full h-auto" alt="Sneakers" />
          </div>
        </div>
      </section>
      <section className="page-width py-8 sm:py-12">
        <p className="micro-label mb-1">What&apos;s hot</p>
        <h2 className="section-title mb-8">Trending in Kenya</h2>
        {loadingTrending ? <LoadingSkeleton /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trending?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
      <section className="page-width py-8 sm:py-12">
        <p className="micro-label mb-1">Customer favourites</p>
        <h2 className="section-title mb-8">Best Sellers</h2>
        {loadingBest ? <LoadingSkeleton /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestsellers?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
      <section className="bg-brand-50 dark:bg-gray-900 py-12">
        <div className="page-width">
          <p className="micro-label mb-1">Just landed</p>
          <h2 className="section-title mb-8">New Arrivals</h2>
          {loadingNew ? <LoadingSkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals?.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
      <section className="page-width py-8 sm:py-12">
        <p className="micro-label mb-1">Shop local</p>
        <h2 className="section-title mb-8">Top Vendors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topVendors?.map((vendor) => (
            <Link key={vendor.id} href={`/products?vendorId=${vendor.id}`} className="card p-4 text-center group cursor-pointer hover:shadow-lg transition-shadow block">
              <Image src={vendor.logo} alt={vendor.storeName} width={64} height={64} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
              <h3 className="font-medium text-sm group-hover:underline">{vendor.storeName}</h3>
              <p className="text-xs text-gray-500 mt-1">{vendor.city}, {vendor.country}</p>
              <p className="text-xs text-gray-400">{vendor.productCount} products</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="page-width py-8 sm:py-12 mb-4 sm:mb-8">
        <div className="relative overflow-hidden rounded-sm">
          <Image src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80" alt="Season sale" width={1600} height={256} className="w-full h-48 md:h-64 object-cover" />
          <div className="absolute inset-0 bg-brand-teal/80 flex items-center justify-center text-center text-white">
            <div>
              <p className="micro-label !text-brand-orange mb-2">Season Sale</p>
              <h2 className="font-display text-xl sm:text-3xl font-semibold mb-4 px-4">Up to 40% Off Selected Styles</h2>
              <Link href="/products?onSale=true" className="btn-primary bg-brand-orange border-brand-orange">Shop Sale</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
