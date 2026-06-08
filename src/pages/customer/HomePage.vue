<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { productApi, vendorApi } from '@/api/services'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import HeroSlider from '@/components/common/HeroSlider.vue'
import { heroImage } from '@/utils/images'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const { data: featured, isLoading: loadingFeatured } = useQuery({ queryKey: ['featured'], queryFn: productApi.getFeatured })
const { data: trending, isLoading: loadingTrending } = useQuery({ queryKey: ['trending'], queryFn: productApi.getTrending })
const { data: bestsellers, isLoading: loadingBest } = useQuery({ queryKey: ['bestsellers'], queryFn: productApi.getBestsellers })
const { data: newArrivals, isLoading: loadingNew } = useQuery({ queryKey: ['newArrivals'], queryFn: productApi.getNewArrivals })
const { data: topVendors } = useQuery({ queryKey: ['topVendors'], queryFn: () => vendorApi.getTop(6) })

const heroSlides = [
  {
    label: "Men's Collection",
    title: 'Sharp Style for Every Occasion',
    subtitle: 'From Nairobi boardrooms to weekend outings — discover premium menswear across East Africa.',
    image: heroImage('men'),
    link: '/products?category=men',
  },
  {
    label: "Women's Fashion",
    title: 'Elegant Looks, African Spirit',
    subtitle: 'Dresses, kitenge-inspired pieces, and contemporary fashion curated for the modern woman.',
    image: heroImage('women'),
    link: '/products?category=women',
  },
  {
    label: 'Kids & Teens',
    title: 'Growing Up in Style',
    subtitle: 'Comfortable, durable clothing for boys, girls, and teens — from playtime to school days.',
    image: heroImage('kids'),
    link: '/products?category=kids',
  },
  {
    label: 'Teen Streetwear',
    title: 'Bold Fits for Young Trendsetters',
    subtitle: 'Streetwear and sportswear that keeps pace with Kenya\'s vibrant youth culture.',
    image: heroImage('teens'),
    link: '/products?search=streetwear',
  },
  {
    label: 'Footwear',
    title: 'Step Out in Confidence',
    subtitle: 'Sneakers, sandals, and boots from trusted vendors across the region.',
    image: heroImage('footwear'),
    link: '/products?category=footwear',
  },
  {
    label: 'Accessories',
    title: 'Complete Your Look',
    subtitle: 'Bags, belts, caps, and more — the finishing touches for every outfit.',
    image: heroImage('accessories'),
    link: '/products?category=accessories',
  },
]

const promos = computed(() => [
  { title: 'Fast Shipping', desc: 'Reliable delivery across East Africa', icon: '🚚' },
  { title: 'M-Pesa & Cards', desc: 'Pay your way, securely', icon: '📱' },
  { title: 'Easy Returns', desc: '14-day return policy', icon: '↩️' },
  { title: 'Verified Vendors', desc: 'Trusted East African sellers', icon: '✓' },
])
</script>

<template>
  <div>
    <HeroSlider :slides="heroSlides" />

    <!-- Promo blocks -->
    <section class="border-b border-gray-200 dark:border-gray-800 bg-brand-50 dark:bg-gray-900">
      <div class="page-width py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="promo in promos" :key="promo.title" class="text-center">
          <span class="text-2xl mb-2 block">{{ promo.icon }}</span>
          <h3 class="font-medium text-sm">{{ promo.title }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ promo.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section class="page-width py-8 sm:py-12">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <p class="micro-label mb-1">Curated for you</p>
          <h2 class="section-title">Featured Products</h2>
        </div>
        <router-link :to="{ name: 'products', query: { featured: 'true' } }" class="flex items-center text-sm font-medium hover:underline text-brand-teal">
          View All <ChevronRightIcon class="w-4 h-4 ml-1" />
        </router-link>
      </div>
      <LoadingSkeleton v-if="loadingFeatured" />
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <ProductCard v-for="p in featured" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- East Africa banner -->
    <section class="bg-brand-teal text-white py-16">
      <div class="page-width grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
        <div>
          <p class="micro-label !text-brand-orange mb-2">Made for East Africa</p>
          <h2 class="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">Fashion From Nairobi to Kampala</h2>
          <p class="text-brand-100 mb-6">Shop local brands and international labels from verified vendors across Kenya, Uganda, Tanzania, Rwanda, and Ethiopia.</p>
          <router-link :to="{ name: 'products', query: { trending: 'true' } }" class="btn-primary bg-brand-orange border-brand-orange hover:bg-brand-orange/90">Explore Trends</router-link>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80" class="aspect-[4/5] object-cover" alt="African fashion" />
          <img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80" class="aspect-[4/5] object-cover mt-6" alt="Women's dress" />
          <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" class="aspect-[4/5] object-cover -mt-6" alt="T-shirt" />
          <img src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80" class="aspect-[4/5] object-cover" alt="Sneakers" />
        </div>
      </div>
    </section>

    <!-- Trending -->
    <section class="page-width py-8 sm:py-12">
      <p class="micro-label mb-1">What's hot</p>
      <h2 class="section-title mb-8">Trending in Kenya</h2>
      <LoadingSkeleton v-if="loadingTrending" />
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <ProductCard v-for="p in trending" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- Best Sellers -->
    <section class="page-width py-8 sm:py-12">
      <p class="micro-label mb-1">Customer favourites</p>
      <h2 class="section-title mb-8">Best Sellers</h2>
      <LoadingSkeleton v-if="loadingBest" />
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <ProductCard v-for="p in bestsellers" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- New Arrivals -->
    <section class="bg-brand-50 dark:bg-gray-900 py-12">
      <div class="page-width">
        <p class="micro-label mb-1">Just landed</p>
        <h2 class="section-title mb-8">New Arrivals</h2>
        <LoadingSkeleton v-if="loadingNew" />
        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <ProductCard v-for="p in newArrivals" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- Top Vendors -->
    <section class="page-width py-8 sm:py-12">
      <p class="micro-label mb-1">Shop local</p>
      <h2 class="section-title mb-8">Top Vendors</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <router-link
          v-for="vendor in topVendors"
          :key="vendor.id"
          :to="{ name: 'products', query: { vendorId: vendor.id } }"
          class="card p-4 text-center group cursor-pointer hover:shadow-lg transition-shadow block"
        >
          <img :src="vendor.logo" :alt="vendor.storeName" class="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
          <h3 class="font-medium text-sm group-hover:underline">{{ vendor.storeName }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ vendor.city }}, {{ vendor.country }}</p>
          <p class="text-xs text-gray-400">{{ vendor.productCount }} products</p>
        </router-link>
      </div>
    </section>

    <!-- Sale banner -->
    <section class="page-width py-8 sm:py-12 mb-4 sm:mb-8">
      <div class="relative overflow-hidden rounded-sm">
        <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80" alt="Season sale" class="w-full h-48 md:h-64 object-cover" />
        <div class="absolute inset-0 bg-brand-teal/80 flex items-center justify-center text-center text-white">
          <div>
            <p class="micro-label !text-brand-orange mb-2">Season Sale</p>
            <h2 class="font-display text-xl sm:text-3xl font-semibold mb-4 px-4">Up to 40% Off Selected Styles</h2>
            <router-link :to="{ name: 'products', query: { onSale: 'true' } }" class="btn-primary bg-brand-orange border-brand-orange">Shop Sale</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
