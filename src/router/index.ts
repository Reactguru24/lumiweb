import { createRouter, createWebHistory } from 'vue-router'
import { setupRouteGuards } from '@/utils/guards'
import type { UserRole } from '@/types'

// Define route meta types
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guest?: boolean
    roles?: UserRole[]
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ============= AUTH ROUTES =============
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guest: true },
      children: [
        { path: '', redirect: '/auth/login' },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/auth/LoginPage.vue'),
          meta: { guest: true },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/auth/RegisterPage.vue'),
          meta: { guest: true },
        },
      ],
    },

    // ============= UNAUTHORIZED PAGE =============
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('@/pages/UnauthorizedPage.vue'),
      meta: { requiresAuth: true },
    },

    // ============= PUBLIC/CUSTOMER ROUTES =============
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/customer/HomePage.vue'),
          meta: { roles: [] }, // Public route
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/pages/customer/ProductsPage.vue'),
          meta: { roles: [] }, // Public route
        },
        {
          path: 'products/:id',
          name: 'product-detail',
          component: () => import('@/pages/customer/ProductDetailPage.vue'),
          meta: { roles: [] }, // Public route
        },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('@/pages/customer/CartPage.vue'),
          meta: { requiresAuth: false, roles: [] }, // Accessible to all
        },
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/pages/customer/CheckoutPage.vue'),
          meta: { requiresAuth: true, roles: ['CUSTOMER'] },
        },
        {
          path: 'account',
          component: () => import('@/pages/customer/AccountLayout.vue'),
          meta: { requiresAuth: true, roles: ['CUSTOMER'] },
          children: [
            {
              path: '',
              name: 'account',
              component: () => import('@/pages/customer/AccountProfilePage.vue'),
              meta: { requiresAuth: true, roles: ['CUSTOMER'] },
            },
            {
              path: 'orders',
              name: 'account-orders',
              component: () => import('@/pages/customer/AccountOrdersPage.vue'),
              meta: { requiresAuth: true, roles: ['CUSTOMER'] },
            },
            {
              path: 'wishlist',
              name: 'account-wishlist',
              component: () => import('@/pages/customer/AccountWishlistPage.vue'),
              meta: { requiresAuth: true, roles: ['CUSTOMER'] },
            },
            {
              path: 'vendor-application',
              name: 'vendor-application',
              component: () => import('@/pages/customer/VendorApplicationPage.vue'),
              meta: { requiresAuth: true, roles: ['CUSTOMER'] },
            },
          ],
        },
      ],
    },

    // ============= VENDOR ROUTES =============
    {
      path: '/vendor',
      component: () => import('@/layouts/VendorLayout.vue'),
      meta: { requiresAuth: true, roles: ['VENDOR'] },
      children: [
        {
          path: '',
          name: 'vendor-dashboard',
          component: () => import('@/pages/vendor/VendorDashboardPage.vue'),
          meta: { requiresAuth: true, roles: ['VENDOR'] },
        },
        {
          path: 'products',
          name: 'vendor-products',
          component: () => import('@/pages/vendor/VendorProductsPage.vue'),
          meta: { requiresAuth: true, roles: ['VENDOR'] },
        },
        {
          path: 'orders',
          name: 'vendor-orders',
          component: () => import('@/pages/vendor/VendorOrdersPage.vue'),
          meta: { requiresAuth: true, roles: ['VENDOR'] },
        },
        {
          path: 'inventory',
          name: 'vendor-inventory',
          component: () => import('@/pages/vendor/VendorInventoryPage.vue'),
          meta: { requiresAuth: true, roles: ['VENDOR'] },
        },
        {
          path: 'analytics',
          name: 'vendor-analytics',
          component: () => import('@/pages/vendor/VendorAnalyticsPage.vue'),
          meta: { requiresAuth: true, roles: ['VENDOR'] },
        },
        {
          path: 'reviews',
          name: 'vendor-reviews',
          component: () => import('@/pages/vendor/VendorReviewsPage.vue'),
          meta: { requiresAuth: true, roles: ['VENDOR'] },
        },
        {
          path: 'profile',
          name: 'vendor-profile',
          component: () => import('@/pages/vendor/VendorProfilePage.vue'),
          meta: { requiresAuth: true, roles: ['VENDOR'] },
        },
      ],
    },

    // ============= ADMIN ROUTES =============
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/AdminDashboardPage.vue'),
          meta: { requiresAuth: true, roles: ['ADMIN'] },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/pages/admin/AdminUsersPage.vue'),
          meta: { requiresAuth: true, roles: ['ADMIN'] },
        },
        {
          path: 'vendors',
          name: 'admin-vendors',
          component: () => import('@/pages/admin/AdminVendorsPage.vue'),
          meta: { requiresAuth: true, roles: ['ADMIN'] },
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/pages/admin/AdminProductsPage.vue'),
          meta: { requiresAuth: true, roles: ['ADMIN'] },
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/pages/admin/AdminOrdersPage.vue'),
          meta: { requiresAuth: true, roles: ['ADMIN'] },
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/pages/admin/AdminSettingsPage.vue'),
          meta: { requiresAuth: true, roles: ['ADMIN'] },
        },
      ],
    },

    // ============= CATCH-ALL ROUTE =============
    { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

// Setup all route guards
setupRouteGuards(router)

export default router
