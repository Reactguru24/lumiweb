import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: '', redirect: '/auth/login' },
        { path: 'login', name: 'login', component: () => import('@/pages/auth/LoginPage.vue'), meta: { guest: true } },
        { path: 'register', name: 'register', component: () => import('@/pages/auth/RegisterPage.vue'), meta: { guest: true } },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/pages/customer/HomePage.vue') },
        { path: 'products', name: 'products', component: () => import('@/pages/customer/ProductsPage.vue') },
        { path: 'products/:id', name: 'product-detail', component: () => import('@/pages/customer/ProductDetailPage.vue') },
        { path: 'cart', name: 'cart', component: () => import('@/pages/customer/CartPage.vue') },
        { path: 'checkout', name: 'checkout', component: () => import('@/pages/customer/CheckoutPage.vue'), meta: { requiresAuth: true, roles: ['CUSTOMER'] } },
        {
          path: 'account',
          component: () => import('@/pages/customer/AccountLayout.vue'),
          meta: { requiresAuth: true, roles: ['CUSTOMER'] },
          children: [
            { path: '', name: 'account', component: () => import('@/pages/customer/AccountProfilePage.vue') },
            { path: 'orders', name: 'account-orders', component: () => import('@/pages/customer/AccountOrdersPage.vue') },
            { path: 'wishlist', name: 'account-wishlist', component: () => import('@/pages/customer/AccountWishlistPage.vue') },
            { path: 'vendor-application', name: 'vendor-application', component: () => import('@/pages/customer/VendorApplicationPage.vue') },
          ],
        },
      ],
    },
    {
      path: '/vendor',
      component: () => import('@/layouts/VendorLayout.vue'),
      meta: { requiresAuth: true, roles: ['VENDOR'] },
      children: [
        { path: '', name: 'vendor-dashboard', component: () => import('@/pages/vendor/VendorDashboardPage.vue') },
        { path: 'products', name: 'vendor-products', component: () => import('@/pages/vendor/VendorProductsPage.vue') },
        { path: 'orders', name: 'vendor-orders', component: () => import('@/pages/vendor/VendorOrdersPage.vue') },
        { path: 'inventory', name: 'vendor-inventory', component: () => import('@/pages/vendor/VendorInventoryPage.vue') },
        { path: 'analytics', name: 'vendor-analytics', component: () => import('@/pages/vendor/VendorAnalyticsPage.vue') },
        { path: 'reviews', name: 'vendor-reviews', component: () => import('@/pages/vendor/VendorReviewsPage.vue') },
        { path: 'profile', name: 'vendor-profile', component: () => import('@/pages/vendor/VendorProfilePage.vue') },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] },
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('@/pages/admin/AdminDashboardPage.vue') },
        { path: 'users', name: 'admin-users', component: () => import('@/pages/admin/AdminUsersPage.vue') },
        { path: 'vendors', name: 'admin-vendors', component: () => import('@/pages/admin/AdminVendorsPage.vue') },
        { path: 'products', name: 'admin-products', component: () => import('@/pages/admin/AdminProductsPage.vue') },
        { path: 'orders', name: 'admin-orders', component: () => import('@/pages/admin/AdminOrdersPage.vue') },
        { path: 'settings', name: 'admin-settings', component: () => import('@/pages/admin/AdminSettingsPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  auth.refreshUser()

  if (to.meta.guest && auth.isAuthenticated) {
    return next(auth.getDashboardRoute())
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  const requiredRoles = to.matched
    .map((r) => r.meta.roles as UserRole[] | undefined)
    .filter(Boolean)
    .flat() as UserRole[]

  if (requiredRoles.length && auth.role && !requiredRoles.includes(auth.role)) {
    return next(auth.getDashboardRoute())
  }

  next()
})

export default router
