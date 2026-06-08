<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string | number
  change?: string
  icon?: Component
}>()
</script>

<template>
  <div class="card p-6 animate-slide-up">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
        <p v-if="change" class="text-xs text-green-600 dark:text-green-400 mt-1">{{ change }}</p>
      </div>
      <component :is="icon" v-if="icon" class="w-8 h-8 text-gray-400" />
    </div>
  </div>
</template>
