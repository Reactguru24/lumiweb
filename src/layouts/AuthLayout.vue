<script setup lang="ts">
import AppLogo from '@/components/common/AppLogo.vue'
import AppearanceControls from '@/components/common/AppearanceControls.vue'
</script>

<template>
  <div class="min-h-screen flex">
    <div class="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80"
        alt="East African fashion"
        class="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div class="relative z-10 flex flex-col justify-end p-12 text-white">
        <AppLogo size="lg" light class="mb-4" />
        <p class="micro-label !text-brand-orange mb-3">East Africa's Fashion Hub</p>
        <h2 class="font-display text-4xl font-semibold mb-4">Style Rooted in Africa</h2>
        <p class="text-gray-300 max-w-md">Discover premium fashion from Kenyan and East African vendors. Shop the latest trends or start selling your brand on LumiAfrica.</p>
      </div>
    </div>
    <div class="flex-1 flex flex-col">
      <div class="flex justify-between items-center p-6">
        <AppLogo class="lg:hidden" />
        <AppearanceControls />
      </div>
      <div class="flex-1 flex items-center justify-center px-6 pb-12">
        <div class="w-full max-w-md animate-slide-up">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
