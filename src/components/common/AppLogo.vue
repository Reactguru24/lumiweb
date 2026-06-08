<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg'; light?: boolean }>()
</script>

<template>
  <router-link to="/" class="flex items-center gap-2 shrink-0" :class="light ? 'text-white' : ''">
    <img
      src="/logo.png"
      alt="LumiAfrica"
      class="object-contain"
      :class="{
        'h-8': size === 'sm',
        'h-10': size === 'md' || !size,
        'h-14': size === 'lg',
      }"
    />
    <span
      v-if="size !== 'sm'"
      class="font-display font-semibold tracking-tight hidden sm:block"
      :class="[
        light ? 'text-white' : 'text-brand-teal dark:text-white',
        size === 'lg' ? 'text-2xl' : 'text-lg',
      ]"
    >
      LumiAfrica
    </span>
  </router-link>
</template>
