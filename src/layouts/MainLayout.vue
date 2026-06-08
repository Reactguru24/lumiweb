<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon,
  HomeIcon, Squares2X2Icon, HeartIcon,
} from '@heroicons/vue/24/outline'
import AppLogo from '@/components/common/AppLogo.vue'
import AppearanceControls from '@/components/common/AppearanceControls.vue'
import { SHOP_CATEGORIES, shopCategoryQuery, shopSubcategoryQuery } from '@/constants/navigation'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const currencyStore = useCurrencyStore()
const mobileMenuOpen = ref(false)
const searchQuery = ref('')
const megaMenuOpen = ref(false)

function search() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'products', query: { search: searchQuery.value } })
    searchQuery.value = ''
    mobileMenuOpen.value = false
  }
}

function goToProducts(query: Record<string, string>) {
  router.push({ name: 'products', query })
  megaMenuOpen.value = false
  mobileMenuOpen.value = false
}

function navigateCategory(categoryName: string) {
  goToProducts(shopCategoryQuery(categoryName) as Record<string, string>)
}

function navigateSubcategory(categoryName: string, subcategory: string) {
  goToProducts(shopSubcategoryQuery(categoryName, subcategory) as Record<string, string>)
}

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="bg-brand-teal text-white text-center text-xs py-2 tracking-wider font-medium">
      FREE DELIVERY ON ORDERS OVER {{ currencyStore.format(currencyStore.freeShippingThresholdKes) }} · M-PESA ACCEPTED · SHOP KENYAN BRANDS
    </div>

    <header class="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <button class="lg:hidden p-2" @click="mobileMenuOpen = !mobileMenuOpen">
            <XMarkIcon v-if="mobileMenuOpen" class="w-6 h-6" />
            <Bars3Icon v-else class="w-6 h-6" />
          </button>

          <AppLogo size="sm" class="lg:mr-8" />

          <nav class="hidden lg:flex items-center gap-8 flex-1">
            <div
              class="relative"
              @mouseenter="megaMenuOpen = true"
              @mouseleave="megaMenuOpen = false"
            >
              <router-link to="/products" class="text-sm font-medium tracking-wide hover:underline">SHOP</router-link>
              <div
                v-show="megaMenuOpen"
                class="absolute top-full left-0 w-[640px] card p-6 shadow-xl mt-0 grid grid-cols-3 gap-6 z-50"
              >
                <div v-for="(config, cat) in SHOP_CATEGORIES" :key="cat">
                  <button class="font-semibold text-sm mb-3 hover:underline text-left w-full" @click="navigateCategory(cat)">{{ cat }}</button>
                  <ul class="space-y-1">
                    <li v-for="item in config.items" :key="item">
                      <button
                        class="text-sm text-gray-500 hover:text-brand-teal dark:hover:text-brand-orange text-left"
                        @click="navigateSubcategory(cat, item)"
                      >{{ item }}</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <router-link :to="{ name: 'products', query: { sort: 'newest' } }" class="text-sm font-medium tracking-wide hover:underline">NEW IN</router-link>
            <router-link :to="{ name: 'products', query: { trending: 'true' } }" class="text-sm font-medium tracking-wide hover:underline">TRENDING</router-link>
            <router-link :to="{ name: 'products', query: { onSale: 'true' } }" class="text-sm font-medium tracking-wide hover:underline text-brand-orange">SALE</router-link>
          </nav>

          <form class="hidden md:flex items-center flex-1 max-w-xs mx-4" @submit.prevent="search">
            <div class="relative w-full">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="searchQuery" type="text" placeholder="Search fashion..." class="input-field pl-10 py-2 text-sm" />
            </div>
          </form>

          <div class="flex items-center gap-2">
            <AppearanceControls />
            <router-link v-if="auth.isAuthenticated" :to="auth.getDashboardRoute()" class="hidden md:block p-2">
              <UserIcon class="w-5 h-5" />
            </router-link>
            <router-link v-else to="/auth/login" class="hidden md:block text-sm font-medium">Sign In</router-link>
            <router-link to="/cart" class="relative p-2">
              <ShoppingBagIcon class="w-5 h-5" />
              <span v-if="cart.itemCount" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] rounded-full flex items-center justify-center">
                {{ cart.itemCount }}
              </span>
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-gray-200 dark:border-gray-800 p-4 space-y-4 animate-slide-up">
        <form @submit.prevent="search" class="flex gap-2">
          <input v-model="searchQuery" type="text" placeholder="Search..." class="input-field flex-1 py-2 text-sm" />
          <button type="submit" class="btn-primary py-2 px-4 text-sm">Go</button>
        </form>
        <router-link to="/products" class="block text-sm font-medium" @click="mobileMenuOpen = false">All Products</router-link>
        <router-link :to="{ name: 'products', query: { sort: 'newest' } }" class="block text-sm font-medium" @click="mobileMenuOpen = false">New In</router-link>
        <router-link :to="{ name: 'products', query: { trending: 'true' } }" class="block text-sm font-medium" @click="mobileMenuOpen = false">Trending</router-link>
        <router-link :to="{ name: 'products', query: { onSale: 'true' } }" class="block text-sm font-medium text-brand-orange" @click="mobileMenuOpen = false">Sale</router-link>
        <div class="border-t border-gray-200 dark:border-gray-800 pt-3">
          <p class="micro-label mb-2">Categories</p>
          <button
            v-for="(config, cat) in SHOP_CATEGORIES"
            :key="cat"
            class="block text-sm py-1 hover:underline"
            @click="navigateCategory(cat)"
          >{{ cat }}</button>
        </div>
        <router-link v-if="!auth.isAuthenticated" to="/auth/login" class="block text-sm font-medium" @click="mobileMenuOpen = false">Sign In</router-link>
        <router-link v-if="!auth.isAuthenticated" to="/auth/register" class="block text-sm font-medium" @click="mobileMenuOpen = false">Register</router-link>
        <button v-if="auth.isAuthenticated" class="block text-sm font-medium text-red-600" @click="handleLogout">Sign Out</button>
      </div>
    </header>

    <main class="flex-1">
      <router-view />
    </main>

    <footer class="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <AppLogo light class="mb-4" />
          <p class="text-sm">East Africa's premier fashion marketplace — shop Kenya, Uganda, Tanzania & beyond.</p>
        </div>
        <div>
          <h4 class="text-white font-medium mb-3">Shop</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/products" class="hover:text-white">All Products</router-link></li>
            <li><router-link :to="{ name: 'products', query: { sort: 'newest' } }" class="hover:text-white">New Arrivals</router-link></li>
            <li><router-link :to="{ name: 'products', query: { trending: 'true' } }" class="hover:text-white">Trending</router-link></li>
            <li><router-link :to="{ name: 'products', query: { onSale: 'true' } }" class="hover:text-white">Sale</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-medium mb-3">Support</h4>
          <ul class="space-y-2 text-sm">
            <li>Free Delivery</li>
            <li>Easy Returns</li>
            <li>M-Pesa Payments</li>
            <li>Verified Vendors</li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-medium mb-3">Sell</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/account/vendor-application" class="hover:text-white">Become a Vendor</router-link></li>
            <li><router-link to="/auth/login" class="hover:text-white">Vendor Login</router-link></li>
          </ul>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm">
        &copy; 2026 LumiAfrica. All rights reserved.
      </div>
    </footer>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-around py-2">
      <router-link to="/" class="flex flex-col items-center p-2 text-xs">
        <HomeIcon class="w-5 h-5" />
        Home
      </router-link>
      <router-link to="/products" class="flex flex-col items-center p-2 text-xs">
        <Squares2X2Icon class="w-5 h-5" />
        Shop
      </router-link>
      <router-link to="/account/wishlist" class="flex flex-col items-center p-2 text-xs">
        <HeartIcon class="w-5 h-5" />
        Wishlist
      </router-link>
      <router-link to="/cart" class="flex flex-col items-center p-2 text-xs relative">
        <ShoppingBagIcon class="w-5 h-5" />
        Cart
        <span v-if="cart.itemCount" class="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{{ cart.itemCount }}</span>
      </router-link>
      <router-link :to="auth.isAuthenticated ? auth.getDashboardRoute() : '/auth/login'" class="flex flex-col items-center p-2 text-xs">
        <UserIcon class="w-5 h-5" />
        Account
      </router-link>
    </nav>
    <div class="h-16 md:hidden" />
  </div>
</template>
