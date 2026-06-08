<script setup lang="ts">
defineProps<{ count?: number; height?: string }>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div v-for="i in (count || 4)" :key="i" class="skeleton" :style="{ height: height || '280px' }" />
  </div>
</template>
